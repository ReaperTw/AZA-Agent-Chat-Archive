function Get-AgentChatSessionFiles {
    param([string]$HarnessRoot, [switch]$IncludeArchived)

    $files = New-Object System.Collections.Generic.List[IO.FileInfo]
    $sessionsRoot = Join-Path (Resolve-LocalPath $HarnessRoot) 'sessions'
    if (Test-Path -LiteralPath $sessionsRoot) {
        foreach ($file in Get-ChildItem -LiteralPath $sessionsRoot -Recurse -File -Filter '*.jsonl') {
            $files.Add($file)
        }
    }
    if ($IncludeArchived) {
        $archivedRoot = Join-Path (Resolve-LocalPath $HarnessRoot) 'archived_sessions'
        if (Test-Path -LiteralPath $archivedRoot) {
            foreach ($file in Get-ChildItem -LiteralPath $archivedRoot -Recurse -File -Filter '*.jsonl') {
                $files.Add($file)
            }
        }
    }
    return $files
}

function Get-AgentChatSessionRecord {
    param([IO.FileInfo]$File)

    $record = New-SessionRecord 'Codex' $File
    Read-JsonLines $File {
        param($event)
        if ($null -eq $event) { $record.WarningCount++; return }

        $eventTimestamp = if (Test-Property $event 'timestamp') { [string]$event.timestamp } else { '' }
        if ($event.type -eq 'session_meta' -and $event.payload) {
            if (Test-Property $event.payload 'id') { $record.Id = [string]$event.payload.id }
            if (Test-Property $event.payload 'cwd') { $record.Cwd = [string]$event.payload.cwd }
            $metaTimestamp = if (Test-Property $event.payload 'timestamp') { $event.payload.timestamp } else { $eventTimestamp }
            $record.Started = Convert-ToLocalDateTime $metaTimestamp $File.CreationTime
            return
        }
        if ($event.type -eq 'response_item' -and $event.payload -and $event.payload.type -eq 'message') {
            $role = [string]$event.payload.role
            if ($role -notin @('user', 'assistant')) { return }
            $raw = Get-ContentText $event.payload.content
            if ($role -eq 'user' -and (Test-InternalApprovalMessage $raw)) {
                $record.IsInternal = $true
                return
            }
            $text = Remove-InternalContext $raw
            if (-not $text) { return }
            $record.Messages.Add([pscustomobject]@{
                Role = $role
                Text = $text
                Timestamp = Convert-ToLocalDateTime $eventTimestamp $record.Started
            })
            return
        }
        if ($event.type -eq 'event_msg' -and $event.payload) {
            $role = switch ([string]$event.payload.type) {
                'user_message' { 'user' }
                'agent_message' { 'assistant' }
                default { '' }
            }
            if (-not $role) { return }
            $raw = if (Test-Property $event.payload 'message') { [string]$event.payload.message }
                elseif (Test-Property $event.payload 'text') { [string]$event.payload.text }
                else { '' }
            if ($role -eq 'user' -and (Test-InternalApprovalMessage $raw)) {
                $record.IsInternal = $true
                return
            }
            $text = Remove-InternalContext $raw
            if (-not $text) { return }
            $record.FallbackMessages.Add([pscustomobject]@{
                Role = $role
                Text = $text
                Timestamp = Convert-ToLocalDateTime $eventTimestamp $record.Started
            })
        }
    }
    if (-not $record.Id -and $File.BaseName -match '([0-9a-f]{8}-[0-9a-f-]{27,})$') {
        $record.Id = $Matches[1]
    }
    if ($record.Messages.Count -eq 0) {
        foreach ($message in $record.FallbackMessages) { $record.Messages.Add($message) }
    }
    return [pscustomobject]$record
}
