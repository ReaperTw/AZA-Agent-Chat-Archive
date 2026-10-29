function Get-AgentChatSessionFiles {
    param([string]$HarnessRoot, [switch]$IncludeArchived)

    $files = New-Object System.Collections.Generic.List[IO.FileInfo]
    $sessionsRoot = Join-Path (Resolve-LocalPath $HarnessRoot) 'sessions'
    if (Test-Path -LiteralPath $sessionsRoot) {
        foreach ($file in Get-ChildItem -LiteralPath $sessionsRoot -Recurse -File -Filter 'chat_history.jsonl') {
            $files.Add($file)
        }
    }
    return $files
}

function Get-AgentChatSessionRecord {
    param([IO.FileInfo]$File)

    $record = New-SessionRecord 'Grok' $File
    $summaryPath = Join-Path $File.Directory.FullName 'summary.json'
    if (Test-Path -LiteralPath $summaryPath -PathType Leaf) {
        try {
            $summary = Get-Content -LiteralPath $summaryPath -Raw -Encoding UTF8 | ConvertFrom-Json
            if ((Test-Property $summary 'info') -and $summary.info) {
                if (Test-Property $summary.info 'id') { $record.Id = [string]$summary.info.id }
                if (Test-Property $summary.info 'cwd') { $record.Cwd = [string]$summary.info.cwd }
            }
            if (Test-Property $summary 'created_at') {
                $record.Started = Convert-ToLocalDateTime $summary.created_at $File.CreationTime
            }
            if (Test-Property $summary 'generated_title') { $record.Title = [string]$summary.generated_title }
        } catch {
            $record.WarningCount++
        }
    }
    if (-not $record.Id) { $record.Id = $File.Directory.Name }
    if (-not $record.Cwd -and $File.Directory.Parent) {
        try { $record.Cwd = [Uri]::UnescapeDataString($File.Directory.Parent.Name) } catch { }
    }
    Read-JsonLines $File {
        param($event)
        if ($null -eq $event) { $record.WarningCount++; return }
        $type = [string]$event.type
        if ($type -eq 'user') {
            if (-not (Test-Property $event 'prompt_index') -or (Test-Property $event 'synthetic_reason')) { return }
            $text = Remove-InternalContext (Get-ContentText $event.content)
            if ($text) {
                $record.Messages.Add([pscustomobject]@{
                    Role = 'user'; Text = $text; Timestamp = $record.Started
                })
            }
        } elseif ($type -eq 'assistant') {
            $text = Remove-InternalContext (Get-ContentText $event.content)
            if ($text) {
                $record.Messages.Add([pscustomobject]@{
                    Role = 'assistant'; Text = $text; Timestamp = $record.Started
                })
            }
        }
    }
    return [pscustomobject]$record
}
