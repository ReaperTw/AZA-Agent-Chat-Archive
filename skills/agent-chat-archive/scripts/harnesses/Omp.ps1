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
