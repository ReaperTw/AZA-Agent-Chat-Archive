function Get-AgentChatSessionFiles {
    param([string]$HarnessRoot, [switch]$IncludeArchived)

    $sessionsRoot = Join-Path (Resolve-LocalPath $HarnessRoot) 'agent\sessions'
    $files = New-Object System.Collections.Generic.List[IO.FileInfo]
    if (-not (Test-Path -LiteralPath $sessionsRoot -PathType Container)) {
        return $files
    }

    foreach ($file in Get-ChildItem -LiteralPath $sessionsRoot -File -Filter '*.jsonl') {
        $files.Add($file)
    }
    foreach ($project in Get-ChildItem -LiteralPath $sessionsRoot -Directory) {
        foreach ($file in Get-ChildItem -LiteralPath $project.FullName -File -Filter '*.jsonl') {
            $files.Add($file)
        }
    }
    return $files
}

function Get-AgentChatSessionRecord {
    param([IO.FileInfo]$File)

    $record = New-SessionRecord 'Omp' $File
    Read-JsonLines $File {
        param($event)
        if ($null -eq $event) {
            $record.WarningCount++
            return
        }

        if ($event.type -eq 'session') {
            if (Test-Property $event 'id') { $record.Id = [string]$event.id }
            if (Test-Property $event 'cwd') { $record.Cwd = [string]$event.cwd }
            if (Test-Property $event 'timestamp') {
                $record.Started = Convert-ToLocalDateTime $event.timestamp $File.CreationTime
            }
            return
        }

        if ($event.type -in @('title', 'title_change') -and (Test-Property $event 'title')) {
            $record.Title = [string]$event.title
            return
        }

        if ($event.type -ne 'message' -or -not (Test-Property $event 'message')) {
            return
        }
        $role = [string]$event.message.role
        if ($role -notin @('user', 'assistant')) { return }
        $text = Remove-InternalContext (Get-ContentText $event.message.content)
        if (-not $text) { return }
        $timestamp = if (Test-Property $event 'timestamp') {
            Convert-ToLocalDateTime $event.timestamp $record.Started
        } else { $record.Started }
        $record.Messages.Add([pscustomobject]@{
            Role = $role
            Text = $text
            Timestamp = $timestamp
        })
    }

    if (-not $record.Id) { $record.Id = $File.BaseName }
    return [pscustomobject]$record
}

function Get-OmpSourceInfo {
    param([IO.FileInfo]$File)
    $info = [ordered]@{
        Id = ''; Parent = ''; References = @{}; LastRole = ''; StopReason = ''
        Warnings = 0; Header = $false
    }
    Read-JsonLines $File {
        param($event)
        if ($null -eq $event) { $info.Warnings++; return }
        if (-not (Test-Property $event 'type')) { $info.Warnings++; return }
        if ($event.type -eq 'session') {
            $info.Header = $true
            if (Test-Property $event 'id') { $info.Id = [string]$event.id }
            if (Test-Property $event 'parentSession') { $info.Parent = [string]$event.parentSession }
        }
        if ($event.type -ne 'message' -or -not (Test-Property $event 'message')) { return }
        $message = $event.message
        if (-not (Test-Property $message 'role')) { $info.Warnings++; return }
        $info.LastRole = [string]$message.role
        $info.StopReason = if (Test-Property $message 'stopReason') { [string]$message.stopReason } else { '' }
        if ($message.role -eq 'assistant' -and (Test-Property $message 'content')) {
            foreach ($block in @($message.content)) {
                if (-not (Test-Property $block 'name') -or $block.name -ne 'task' -or -not (Test-Property $block 'arguments')) { continue }
                if (-not (Test-Property $block.arguments 'tasks')) { $info.Warnings++; continue }
                foreach ($task in @($block.arguments.tasks)) {
                    if ((Test-Property $task 'name') -and $task.name) { $info.References[[string]$task.name] = $true }
                    else { $info.Warnings++ }
                }
            }
        }
        if ($message.role -eq 'toolResult' -and (Test-Property $message 'toolName') -and $message.toolName -eq 'task' -and (Test-Property $message 'details')) {
            foreach ($field in @('progress', 'results')) {
                if (-not (Test-Property $message.details $field)) { continue }
                foreach ($item in @($message.details.$field)) {
                    if ((Test-Property $item 'id') -and $item.id) { $info.References[[string]$item.id] = $true }
                }
            }
        }
    }
    if (-not $info.Header -or -not $info.Id) { $info.Warnings++ }
    return [pscustomobject]$info
}

function Export-OmpBundle {
    param($Record, [string]$RequestedTitle, $Config)
    if ($Record.Messages.Count -eq 0) {
        return [pscustomobject]@{ Status = 'SKIPPED'; Path = ''; Reason = 'no-visible-messages' }
    }
    $settings = $Config.harnesses.Omp
    $destination = Join-Path $Config.outputRoot (Get-ProjectFolder $Record $settings)
    [IO.Directory]::CreateDirectory($destination) | Out-Null
    $title = if ($RequestedTitle) { Get-SafeFilePart $RequestedTitle } else { Get-DerivedTitle $Record }
    $base = ([string]$settings.filePrefix) + $title + '_' + $Record.Started.ToString('yyyyMMdd_HHmmss')
    $existing = Find-ExistingExport $Config.outputRoot $Record
    $oldBundle = $null
    $oldFlat = $null
    if ($existing) {
        if ([IO.Path]::GetFileName($existing) -eq 'conversation.md' -and (Test-Path -LiteralPath (Join-Path (Split-Path $existing) 'manifest.json'))) {
            $oldBundle = Split-Path $existing
        } else { $oldFlat = $existing }
    }
    if ($oldBundle -and -not $RequestedTitle) {
        $bundle = $oldBundle
    } else {
        $bundle = Join-Path $destination $base
        $suffix = 2
        while ((Test-Path -LiteralPath $bundle) -and (-not $oldBundle -or -not $bundle.Equals($oldBundle, [StringComparison]::OrdinalIgnoreCase))) {
            $bundle = Join-Path $destination ("${base}_$suffix")
            $suffix++
        }
        if ($oldBundle -and -not $bundle.Equals($oldBundle, [StringComparison]::OrdinalIgnoreCase)) {
            Move-Item -LiteralPath $oldBundle -Destination $bundle
        }
    }
    [IO.Directory]::CreateDirectory($bundle) | Out-Null
    $attachmentDir = Join-Path $bundle 'subagents'
    [IO.Directory]::CreateDirectory($attachmentDir) | Out-Null
    $manifestPath = Join-Path $bundle 'manifest.json'
    $previous = @()
    $warnings = New-Object System.Collections.Generic.List[string]
    if (Test-Path -LiteralPath $manifestPath) {
        try {
            $oldManifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
            if (Test-Property $oldManifest 'subagents') { $previous = @($oldManifest.subagents) }
        } catch { $warnings.Add('Previous manifest could not be read; existing attachments were retained.') }
    }
    $sources = @{}
    $sourceDir = Join-Path $Record.File.DirectoryName $Record.File.BaseName
    try {
        $rootInfo = Get-OmpSourceInfo $Record.File
        $sources[$Record.File.FullName] = [pscustomobject]@{ File = $Record.File; Info = $rootInfo; Record = $Record; Name = ''; ParentId = '' }
        if ($rootInfo.Warnings -gt 0) { $warnings.Add('Root source is malformed or incomplete.') }
    } catch {
        $warnings.Add('Root source could not be inspected for child references.')
    }
    try {
        if (Test-Path -LiteralPath $sourceDir -PathType Container -ErrorAction Stop) {
            foreach ($file in @(Get-ChildItem -LiteralPath $sourceDir -Filter '*.jsonl' -File -Recurse -ErrorAction Stop)) {
                try {
                    $info = Get-OmpSourceInfo $file
                    $child = Get-AgentChatSessionRecord $file
                    $sources[$file.FullName] = [pscustomobject]@{ File = $file; Info = $info; Record = $child; Name = $file.BaseName; ParentId = '' }
                } catch {
                    $warnings.Add("Child source '$($file.BaseName)' could not be read.")
                    $sources[$file.FullName] = [pscustomobject]@{ File = $file; Info = $null; Record = $null; Name = $file.BaseName; ParentId = '' }
                }
            }
        } elseif (Test-Path -LiteralPath $sourceDir -ErrorAction Stop) {
            $warnings.Add('Child discovery path is not a directory.')
        }
    } catch {
        $warnings.Add('Child discovery was unavailable or incomplete.')
    }
    $entries = New-Object System.Collections.Generic.List[object]
    $matched = @{}
    foreach ($source in @($sources.Values)) {
        if ($source.File.FullName -eq $Record.File.FullName) { continue }
        $info = $source.Info
        $identity = @()
        if ($info -and $info.Id) { $identity = @($previous | Where-Object id -eq $info.Id) }
        $parentId = ''
        $parentKnown = $false
        if ($info -and $info.Parent -and $sources.ContainsKey($info.Parent)) {
            $parentSource = $sources[$info.Parent]
            if ($parentSource.Info -and $parentSource.Info.Id) {
                $parentId = $parentSource.Info.Id
                $parentKnown = $true
            }
        }
        if (-not $parentKnown) {
            if ($identity.Count -eq 1) { $parentId = $identity[0].parentId }
            elseif ($source.File.DirectoryName -eq $sourceDir) { $parentId = $Record.Id }
        }
        $source.ParentId = $parentId
        $id = if ($info -and $info.Id) { $info.Id } else { $source.Name }
        $prior = @()
        if ($identity.Count -eq 1) { $prior = @($identity[0]) }
        elseif (-not $info -or -not $info.Id) {
            $prior = @($previous | Where-Object { $_.parentId -eq $parentId -and $_.name -eq $source.Name } | Select-Object -First 1)
        }
        if ((-not $info -or -not $info.Id) -and $prior.Count -gt 0) { $id = [string]$prior[0].id }
        $relative = 'subagents/' + (Get-SafeFilePart $id 'agent' 120) + '.md'
        if ($prior.Count -gt 0 -and $prior[0].path -match '^subagents/[^/\\]+\.md$') { $relative = [string]$prior[0].path }
        $path = Join-Path $bundle ($relative.Replace('/', [IO.Path]::DirectorySeparatorChar))
        $problems = New-Object System.Collections.Generic.List[string]
        if (-not $parentKnown) { $problems.Add('Child parent is unavailable.') }
        if (-not $info -or -not $info.Header -or -not $info.Id -or $info.Warnings -gt 0) { $problems.Add('Child source is unreadable or malformed.') }
        if (-not $info -or $info.LastRole -ne 'assistant' -or $info.StopReason -ne 'stop') { $problems.Add('Child source is unfinished.') }
        if (-not $source.Record -or $source.Record.Messages.Count -eq 0) { $problems.Add('Child has no visible messages.') }
        $count = 0
        $retained = ($prior.Count -gt 0) -and (Test-Path -LiteralPath $path)
        if ($source.Record -and $source.Record.Messages.Count -gt 0 -and ($problems.Count -eq 0 -or -not $retained)) {
            try {
                $metadata = ('> **Agent**: `{0}`{3}> **Session ID**: `{1}`{3}> **Parent session ID**: `{2}`{3}{3}' -f $source.Name, $id, $parentId, "`r`n")
                Write-AtomicText $path ($metadata + (ConvertTo-ArchiveMarkdown $source.Record)) $true
                $count = $source.Record.Messages.Count
            } catch { $problems.Add('Child attachment could not be saved.') }
        }
        if ($count -eq 0) {
            if ($retained) { $count = $prior[0].messages }
            else { $relative = $null }
        }
        $status = if ($problems.Count) { 'partial' } else { 'complete' }
        foreach ($problem in $problems) { $warnings.Add("Child '$($source.Name)': $problem") }
        $entries.Add([pscustomobject]@{ id = $id; parentId = $parentId; name = $source.Name; path = $relative; status = $status; messages = $count; warnings = @($problems.ToArray()) })
        $matched["$parentId|$id"] = $true
    }
    foreach ($source in @($sources.Values)) {
        if (-not $source.Info) { continue }
        foreach ($name in $source.Info.References.Keys) {
            $found = @($entries | Where-Object { $_.parentId -eq $source.Info.Id -and ($_.name -eq $name -or $_.id -eq $name) })
            if ($found.Count -gt 0) { continue }
            $prior = @($previous | Where-Object { $_.parentId -eq $source.Info.Id -and ($_.name -eq $name -or $_.id -eq $name) } | Select-Object -First 1)
            $id = $name; $relative = $null; $count = 0
            if ($prior.Count -gt 0) { $id = $prior[0].id; $relative = $prior[0].path; $count = $prior[0].messages }
            $problem = "Referenced child '$name' is unavailable."
            $warnings.Add($problem)
            $entries.Add([pscustomobject]@{ id = $id; parentId = $source.Info.Id; name = $name; path = $relative; status = 'partial'; messages = $count; warnings = @($problem) })
            $matched["$($source.Info.Id)|$id"] = $true
        }
    }
    foreach ($old in $previous) {
        if ($matched.ContainsKey("$($old.parentId)|$($old.id)")) { continue }
        $problem = "Previously archived child '$($old.name)' was not discovered."
        $warnings.Add($problem)
        $entries.Add([pscustomobject]@{ id = $old.id; parentId = $old.parentId; name = $old.name; path = $old.path; status = 'partial'; messages = $old.messages; warnings = @($problem) })
    }
    $status = if ($warnings.Count -or $Record.WarningCount) { 'partial' } else { 'complete' }
    if ($Record.WarningCount) { $warnings.Add('Root source contains malformed records.') }
    $conversation = Join-Path $bundle 'conversation.md'
    $index = New-Object Text.StringBuilder
    [void]$index.AppendLine('## Subagents')
    [void]$index.AppendLine()
    [void]$index.AppendLine("Export completeness: **$status**. [Manifest](manifest.json)")
    [void]$index.AppendLine()
    foreach ($entry in @($entries.ToArray() | Sort-Object parentId, name, id)) {
        $label = ([string]$entry.name).Replace('\', '\\').Replace('[', '\[').Replace(']', '\]')
        $link = if ($entry.path) { "[$label](<$($entry.path)>)" } else { $label }
        [void]$index.AppendLine("- ${link}: $($entry.status); parent ``$($entry.parentId)``; messages=$($entry.messages)")
    }
    if ($warnings.Count) {
        [void]$index.AppendLine()
        [void]$index.AppendLine('### Unresolved items')
        foreach ($warning in $warnings) { [void]$index.AppendLine("- $warning") }
    }
    Write-AtomicText $conversation ((ConvertTo-ArchiveMarkdown $Record) + "`r`n" + $index.ToString()) $true
    $manifest = [ordered]@{ sessionId = $Record.Id; status = $status; messages = $Record.Messages.Count; warnings = @($warnings.ToArray()); subagents = @($entries.ToArray()) }
    Write-AtomicText $manifestPath (($manifest | ConvertTo-Json -Depth 20) + "`r`n") $true
    if ($oldFlat -and (Test-Path -LiteralPath $oldFlat)) { Remove-Item -LiteralPath $oldFlat }
    $files = New-Object System.Collections.Generic.List[string]
    $files.Add($conversation); $files.Add($manifestPath)
    foreach ($file in @(Get-ChildItem -LiteralPath $attachmentDir -File -Filter '*.md')) { $files.Add($file.FullName) }
    return [pscustomobject]@{ Status = 'EXPORTED'; Path = $conversation; Reason = ''; Messages = $Record.Messages.Count; Warnings = $warnings.Count; Completeness = $status; Files = @($files.ToArray()) }
}
