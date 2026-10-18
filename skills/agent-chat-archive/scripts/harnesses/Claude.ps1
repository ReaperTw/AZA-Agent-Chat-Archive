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

    if ($Event.message -and (Test-Property $Event.message 'id') -and $Event.message.id) {
        return [string]$Event.message.id
    }
    if ((Test-Property $Event 'uuid') -and $Event.uuid) {
        return [string]$Event.uuid
    }
    return ''
}

function Get-ClaudeVisibleText {
    param($Event)

    if ((Test-Property $Event 'isMeta') -and $Event.isMeta) { return '' }
    if ((Test-Property $Event 'isSidechain') -and $Event.isSidechain) { return '' }
    if (-not (Test-Property $Event 'message') -or -not $Event.message) { return '' }
    $role = if (Test-Property $Event.message 'role') { [string]$Event.message.role } else { '' }
    if ($role -notin @('user', 'assistant')) { return '' }

    $raw = Get-ContentText $Event.message.content
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
    param([IO.FileInfo]$File)

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
        if ((Test-Property $event 'sessionId') -and $event.sessionId -and -not $record.Id) {
            $record.Id = [string]$event.sessionId
        }
        if ((Test-Property $event 'cwd') -and $event.cwd -and -not $record.Cwd) {
            $record.Cwd = [string]$event.cwd
        }
        if ((Test-Property $event 'timestamp') -and $event.timestamp -and -not $state.HasStarted) {
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
        if ($event.type -notin @('user', 'assistant')) { return }
        if ((Test-Property $event 'isSidechain') -and $event.isSidechain) { return }
        if (-not (Test-Property $event 'uuid') -or -not $event.uuid) {
            $record.WarningCount++
            return
        }
        $id = [string]$event.uuid
        $nodes[$id] = $event
        $state.LastMessageId = $id
    }

    if (-not $record.Id) { $record.Id = $File.BaseName }

    $branch = New-Object System.Collections.Generic.List[object]
    $seen = @{}
    $current = $state.LastMessageId
    while ($current -and $nodes.ContainsKey($current) -and -not $seen.ContainsKey($current)) {
        $seen[$current] = $true
        $event = $nodes[$current]
        $branch.Add($event)
        $current = if ((Test-Property $event 'parentUuid') -and $event.parentUuid) {
            [string]$event.parentUuid
        } else { '' }
    }
    $ordered = $branch.ToArray()
    [array]::Reverse($ordered)

    $lastIndex = @{}
    for ($i = 0; $i -lt $ordered.Count; $i++) {
        $key = Get-ClaudeMessageKey $ordered[$i]
        if ($key) { $lastIndex[$key] = $i }
    }
    for ($i = 0; $i -lt $ordered.Count; $i++) {
        $event = $ordered[$i]
        $key = Get-ClaudeMessageKey $event
        if ($key -and $lastIndex[$key] -ne $i) { continue }
        $text = Get-ClaudeVisibleText $event
        if (-not $text) { continue }
        $timestamp = if ((Test-Property $event 'timestamp') -and $event.timestamp) {
            Convert-ToLocalDateTime $event.timestamp $record.Started
        } else { $record.Started }
        $record.Messages.Add([pscustomobject]@{
            Role = [string]$event.message.role
            Text = $text
            Timestamp = $timestamp
        })
    }
    return [pscustomobject]$record
}
