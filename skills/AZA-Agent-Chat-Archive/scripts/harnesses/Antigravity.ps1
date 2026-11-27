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
    # Listing needs no subagent tree; reading it for every candidate would be slow.
    if (-not $List) { $arguments += '--tree' }
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
    # A subagent belongs in its parent's bundle. It stays listable only when the parent
    # conversation is no longer on this machine, so its work is not lost.
    $record.IsInternal = [bool]($data.parentId -and (Test-Path -LiteralPath (Join-Path $File.DirectoryName "$($data.parentId).db")))
    $record.Subagents = @($data.subagents)
    return [pscustomobject]$record
}

# Subagents of an Antigravity conversation, for Export-SubagentBundle.
function Get-SubagentChildren {
    param($Record)

    foreach ($sub in @($Record.Subagents)) {
        if (-not $sub) { continue }
        $child = $null
        if (@($sub.messages).Count -gt 0) {
            $fake = New-Object IO.FileInfo (Join-Path $Record.File.DirectoryName "$($sub.id).db")
            $child = New-SessionRecord 'Antigravity' $fake
            $child.Id = [string]$sub.id
            $child.Cwd = [string]$sub.cwd
            $child.Started = Convert-ToLocalDateTime $sub.started $Record.Started
            foreach ($message in @($sub.messages)) {
                $child.Messages.Add([pscustomobject]@{ Role = [string]$message.role; Text = [string]$message.text; Timestamp = $child.Started })
            }
            $child = [pscustomobject]$child
        }
        [pscustomobject]@{
            Id = [string]$sub.id
            ParentId = [string]$sub.parentId
            Name = [string]$sub.role
            Type = [string]$sub.type
            Model = ''
            Record = $child
            Problems = @($sub.problems)
        }
    }
}
