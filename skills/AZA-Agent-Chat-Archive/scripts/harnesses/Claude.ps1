function Get-AgentChatSessionFiles {
    param([string]$HarnessRoot, [switch]$IncludeArchived)

    $files = New-Object System.Collections.Generic.List[IO.FileInfo]
    $projectsRoot = Join-Path (Resolve-LocalPath $HarnessRoot) 'projects'
    if (-not (Test-Path -LiteralPath $projectsRoot -PathType Container)) {
        return $files
    }

    foreach ($project in Get-ChildItem -LiteralPath $projectsRoot -Directory) {
        foreach ($file in Get-ChildItem -LiteralPath $project.FullName -File -Filter '*.jsonl') {
            if ($file.Name -match '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.jsonl$') {
                $files.Add($file)
            }
        }
    }
    return $files
}

function Get-ClaudeMessageKey {
    param($Event)

    if ((Test-Property $Event 'message') -and $Event.message -and (Test-Property $Event.message 'id') -and $Event.message.id) {
        return [string]$Event.message.id
    }
    if ((Test-Property $Event 'uuid') -and $Event.uuid) {
        return [string]$Event.uuid
    }
    return ''
}

function Get-ClaudeVisibleText {
    param($Event, [switch]$Sidechain)

    if ((Test-Property $Event 'isMeta') -and $Event.isMeta) { return '' }
    if (-not $Sidechain -and (Test-Property $Event 'isSidechain') -and $Event.isSidechain) { return '' }
    if (-not (Test-Property $Event 'message') -or -not $Event.message) { return '' }
    $role = if (Test-Property $Event.message 'role') { [string]$Event.message.role } else { '' }
    if ($role -notin @('user', 'assistant')) { return '' }

    $raw = Get-ContentText $Event.message.content
    # A subagent delivers its final report through SubagentHandback; that report is what the
    # caller sees, so it counts as the subagent's visible answer.
    if ($Sidechain -and $role -eq 'assistant' -and $Event.message.content -isnot [string]) {
        foreach ($block in @($Event.message.content)) {
            if ($block -and (Test-Property $block 'type') -and $block.type -eq 'tool_use' -and
                (Test-Property $block 'name') -and $block.name -eq 'SubagentHandback' -and
                (Test-Property $block 'input') -and $block.input -and (Test-Property $block.input 'message') -and $block.input.message) {
                $raw = (($raw, [string]$block.input.message) | Where-Object { $_ }) -join "`r`n`r`n"
            }
        }
    }
    if (-not $raw) { return '' }
    # A slash-command entry stores the command plus the injected skill body. Keep the command only.
    if ($role -eq 'user' -and $raw -match '(?is)<command-name(?:\s[^>]*)?>(?<name>.*?)</command-name\s*>') {
        $name = $Matches['name'].Trim()
        $args = ''
        if ($raw -match '(?is)<command-args(?:\s[^>]*)?>(?<args>.*?)</command-args\s*>') {
            $args = $Matches['args'].Trim()
        }
        if ($args) { return "$name $args".Trim() }
        return $name
    }
    return Remove-InternalContext $raw
}

function Get-AgentChatSessionRecord {
    param([IO.FileInfo]$File, [switch]$Sidechain)

    $record = New-SessionRecord 'Claude' $File
    $nodes = @{}
    $state = [pscustomobject]@{
        LastMessageId = ''
        HasCustomTitle = $false
        HasStarted = $false
    }
    Read-JsonLines $File {
        param($event)
        if ($null -eq $event) {
            $record.WarningCount++
            return
        }
        if ($Sidechain -and (Test-Property $event 'agentId') -and $event.agentId -and -not $record.Id) {
            $record.Id = [string]$event.agentId
        }
        if (-not $Sidechain -and (Test-Property $event 'sessionId') -and $event.sessionId -and -not $record.Id) {
            $record.Id = [string]$event.sessionId
        }
        if ((Test-Property $event 'cwd') -and $event.cwd -and -not $record.Cwd) {
            $record.Cwd = [string]$event.cwd
        }
        # Bookkeeping entries (queue-operation etc.) can be appended with later timestamps; date the
        # session from its first conversation event.
        if ($event.type -in @('user', 'assistant') -and (Test-Property $event 'timestamp') -and $event.timestamp -and -not $state.HasStarted) {
            $record.Started = Convert-ToLocalDateTime $event.timestamp $File.CreationTime
            $state.HasStarted = $true
        }
        if ($event.type -eq 'custom-title' -and (Test-Property $event 'customTitle') -and $event.customTitle) {
            $record.Title = [string]$event.customTitle
            $state.HasCustomTitle = $true
            return
        }
        if (-not $state.HasCustomTitle -and $event.type -eq 'summary' -and (Test-Property $event 'summary') -and $event.summary) {
            $record.Title = [string]$event.summary
            return
        }
        if (-not $Sidechain -and (Test-Property $event 'isSidechain') -and $event.isSidechain) { return }
        $isMessage = $event.type -in @('user', 'assistant')
        if (-not (Test-Property $event 'uuid') -or -not $event.uuid) {
            if ($isMessage) { $record.WarningCount++ }
            return
        }
        # Attachments and system entries sit inside the parentUuid chain; keep them as links.
        $id = [string]$event.uuid
        $nodes[$id] = $event
        if ($isMessage) { $state.LastMessageId = $id }
    }

    if (-not $record.Id) { $record.Id = if ($Sidechain) { $File.BaseName -replace '^agent-', '' } else { $File.BaseName } }

    $branch = New-Object System.Collections.Generic.List[object]
    $seen = @{}
    $current = $state.LastMessageId
    while ($current -and $nodes.ContainsKey($current) -and -not $seen.ContainsKey($current)) {
        $seen[$current] = $true
        $event = $nodes[$current]
        $branch.Add($event)
        $current = if ((Test-Property $event 'parentUuid') -and $event.parentUuid) {
            [string]$event.parentUuid
        } elseif ((Test-Property $event 'logicalParentUuid') -and $event.logicalParentUuid) {
            [string]$event.logicalParentUuid
        } else { '' }
    }
    $ordered = $branch.ToArray()
    [array]::Reverse($ordered)

    # Current Claude Code stores one API message as several events, one content block each, so
    # a text block followed by a tool_use shares its message id: keep every block. An event that
    # carries several blocks is a cumulative snapshot instead; for such ids only the last counts.
    $lastIndex = @{}
    $snapshotKeys = @{}
    for ($i = 0; $i -lt $ordered.Count; $i++) {
        $event = $ordered[$i]
        $key = Get-ClaudeMessageKey $event
        if (-not $key) { continue }
        $lastIndex[$key] = $i
        if ((Test-Property $event 'message') -and $event.message -and (Test-Property $event.message 'content') -and
            $event.message.content -isnot [string] -and @($event.message.content).Count -gt 1) {
            $snapshotKeys[$key] = $true
        }
    }
    # Merge consecutive same-role text (separated only by tool activity) into one turn.
    $seenText = @{}
    $last = $null
    for ($i = 0; $i -lt $ordered.Count; $i++) {
        $event = $ordered[$i]
        if ($event.type -notin @('user', 'assistant')) { continue }
        $key = Get-ClaudeMessageKey $event
        if ($key -and $snapshotKeys.ContainsKey($key) -and $lastIndex[$key] -ne $i) { continue }
        $text = Get-ClaudeVisibleText $event -Sidechain:$Sidechain
        if (-not $text) { continue }
        if ($key) {
            $textKey = "$key`n$text"
            if ($seenText.ContainsKey($textKey)) { continue }
            $seenText[$textKey] = $true
        }
        $role = [string]$event.message.role
        if ($null -ne $last -and $last.Role -eq $role) {
            $last.Text = $last.Text + "`r`n`r`n" + $text
            continue
        }
        $timestamp = if ((Test-Property $event 'timestamp') -and $event.timestamp) {
            Convert-ToLocalDateTime $event.timestamp $record.Started
        } else { $record.Started }
        $last = [pscustomobject]@{
            Role = $role
            Text = $text
            Timestamp = $timestamp
        }
        $record.Messages.Add($last)
    }
    return [pscustomobject]$record
}

function Get-ClaudeSubagentFiles {
    param($Record)

    $dir = Join-Path (Join-Path $Record.File.DirectoryName $Record.File.BaseName) 'subagents'
    if (-not (Test-Path -LiteralPath $dir -PathType Container)) { return @() }
    return @(Get-ChildItem -LiteralPath $dir -File -Filter 'agent-*.jsonl' | Sort-Object Name)
}

# Subagents of a Claude Code session, for Export-SubagentBundle.
function Get-SubagentChildren {
    param($Record)

    $agentFiles = @(Get-ClaudeSubagentFiles $Record)
    foreach ($file in $agentFiles) {
        $id = $file.BaseName -replace '^agent-', ''
        $problems = New-Object System.Collections.Generic.List[string]
        $meta = $null
        $metaPath = $file.FullName -replace '\.jsonl$', '.meta.json'
        if (Test-Path -LiteralPath $metaPath) {
            try { $meta = Get-Content -LiteralPath $metaPath -Raw -Encoding UTF8 | ConvertFrom-Json } catch { $problems.Add('Subagent metadata is unreadable.') }
        }
        if (-not $meta -or -not (Test-Property $meta 'finished')) { $problems.Add('Subagent completion is unknown.') }
        elseif (-not $meta.finished) { $problems.Add('Subagent is unfinished.') }

        # A nested subagent's spawning tool call sits in its parent's transcript.
        $parentId = $Record.Id
        if ($meta -and (Test-Property $meta 'toolUseId') -and $meta.toolUseId) {
            foreach ($other in $agentFiles) {
                if ($other.FullName -eq $file.FullName) { continue }
                if (Select-String -LiteralPath $other.FullName -SimpleMatch ('"id":"' + $meta.toolUseId + '"') -Quiet) {
                    $parentId = $other.BaseName -replace '^agent-', ''
                    break
                }
            }
        }

        $child = $null
        try {
            $child = Get-AgentChatSessionRecord $file -Sidechain
            if ($child.WarningCount) { $problems.Add('Subagent source contains malformed records.') }
        } catch { $problems.Add('Subagent source could not be read.') }

        [pscustomobject]@{
            Id = $id
            ParentId = $parentId
            Name = if ($meta -and (Test-Property $meta 'description')) { [string]$meta.description } else { '' }
            Type = if ($meta -and (Test-Property $meta 'agentType')) { [string]$meta.agentType } else { '' }
            Model = if ($meta -and (Test-Property $meta 'model')) { [string]$meta.model } else { '' }
            Record = $child
            Problems = @($problems.ToArray())
        }
    }
}
