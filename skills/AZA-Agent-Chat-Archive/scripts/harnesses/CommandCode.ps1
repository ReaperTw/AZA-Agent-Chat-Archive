function Get-AgentChatSessionFiles {
    param([string]$HarnessRoot, [switch]$IncludeArchived)

    $files = New-Object System.Collections.Generic.List[IO.FileInfo]
    $projectsRoot = Join-Path (Resolve-LocalPath $HarnessRoot) 'projects'
    if (Test-Path -LiteralPath $projectsRoot) {
        foreach ($file in Get-ChildItem -LiteralPath $projectsRoot -Recurse -File -Filter '*.jsonl') {
            if ($file.Name -match '^[0-9a-fA-F-]{36}\.jsonl$') { $files.Add($file) }
        }
    }
    return $files
}

function Get-AgentChatSessionRecord {
    param([IO.FileInfo]$File)

    $record = New-SessionRecord 'CommandCode' $File
    $nodes = @{}
    $state = [pscustomobject]@{ LastMessageId = '' }
    Read-JsonLines $File {
        param($event)
        if ($null -eq $event) { $record.WarningCount++; return }
        if ($event.type -eq 'session') {
            if (Test-Property $event 'id') { $record.Id = [string]$event.id }
            if (Test-Property $event 'cwd') { $record.Cwd = [string]$event.cwd }
            if (Test-Property $event 'timestamp') {
                $record.Started = Convert-ToLocalDateTime $event.timestamp $File.CreationTime
            }
            return
        }
        if ($event.type -eq 'message' -and (Test-Property $event 'id')) {
            $id = [string]$event.id
            $nodes[$id] = $event
            $state.LastMessageId = $id
        }
    }
    if (-not $record.Id) { $record.Id = $File.BaseName }
    $metaPath = $File.FullName -replace '\.jsonl$', '.meta.json'
    if (Test-Path -LiteralPath $metaPath -PathType Leaf) {
        try {
            $meta = Get-Content -LiteralPath $metaPath -Raw -Encoding UTF8 | ConvertFrom-Json
            if (Test-Property $meta 'title') { $record.Title = [string]$meta.title }
        } catch {
            $record.WarningCount++
        }
    }

    $branch = New-Object System.Collections.Generic.List[object]
    $seen = @{}
    $current = $state.LastMessageId
    while ($current -and $nodes.ContainsKey($current) -and -not $seen.ContainsKey($current)) {
        $seen[$current] = $true
        $event = $nodes[$current]
        $branch.Add($event)
        $current = if (Test-Property $event 'parentId') { [string]$event.parentId } else { '' }
    }
    $ordered = $branch.ToArray()
    [array]::Reverse($ordered)
    foreach ($event in $ordered) {
        if (-not $event.message) { continue }
        $role = [string]$event.message.role
        if ($role -notin @('user', 'assistant')) { continue }
        $text = Remove-InternalContext (Get-ContentText $event.message.content)
        if (-not $text) { continue }
        $timestamp = if (Test-Property $event 'timestamp') {
            Convert-ToLocalDateTime $event.timestamp $record.Started
        } else { $record.Started }
        $record.Messages.Add([pscustomobject]@{
            Role = $role; Text = $text; Timestamp = $timestamp
        })
    }
    return [pscustomobject]$record
}
