function Get-AgentChatSessionFiles {
    param([string]$HarnessRoot, [switch]$IncludeArchived)

    $roots = @((Resolve-LocalPath $HarnessRoot))
    if (-not $script:BoundParameters.ContainsKey('AntigravityHome') -and -not $env:ANTIGRAVITY_APP_DATA_DIR) {
        $roots += Join-Path (Split-Path -Parent $roots[0]) 'antigravity-cli'
    }
    foreach ($root in $roots) {
        $conversations = Join-Path $root 'conversations'
        if (Test-Path -LiteralPath $conversations -PathType Container) {
            Get-ChildItem -LiteralPath $conversations -File -Filter '*.db'
        }
    }
}

function Get-AgentChatSessionRecord {
    param([IO.FileInfo]$File)

    $python = Get-Command python, python3, py -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $python) { throw 'Antigravity export requires Python 3 with the standard sqlite3 module.' }
    $arguments = @()
    if ($python.Name -in @('py', 'py.exe')) { $arguments += '-3' }
    $arguments += @((Join-Path $PSScriptRoot '../Read-AntigravityChat.py'), $File.FullName)
    $json = & $python.Source @arguments
    if ($LASTEXITCODE -ne 0) { throw "Cannot read Antigravity conversation '$($File.Name)'; no archive was written." }
    $data = $json | ConvertFrom-Json
    $record = New-SessionRecord 'Antigravity' $File
    $record.Id = [string]$data.id
    $record.Cwd = [string]$data.cwd
    $record.Title = [string]$data.title
    $record.Started = Convert-ToLocalDateTime $data.started $File.CreationTime
    $record.WarningCount = [int]$data.warnings
    foreach ($message in $data.messages) {
        $record.Messages.Add([pscustomobject]@{
            Role = [string]$message.role
            Text = [string]$message.text
            Timestamp = $record.Started
        })
    }
    return [pscustomobject]$record
}
