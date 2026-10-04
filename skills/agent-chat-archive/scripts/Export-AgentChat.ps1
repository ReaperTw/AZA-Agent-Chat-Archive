[CmdletBinding(DefaultParameterSetName = 'Latest')]
param(
    [Parameter(ParameterSetName = 'Latest')]
    [switch]$Latest,

    [Parameter(Mandatory, ParameterSetName = 'SessionId')]
    [string]$SessionId,

    [Parameter(Mandatory, ParameterSetName = 'Path')]
    [string]$SessionPath,

    [Parameter(Mandatory, ParameterSetName = 'All')]
    [switch]$All,

    [Parameter(Mandatory, ParameterSetName = 'List')]
    [switch]$List,

    [Parameter(Mandatory, ParameterSetName = 'Configure')]
    [switch]$Configure,

    [Parameter(Mandatory, ParameterSetName = 'ShowConfig')]
    [switch]$ShowConfig,

    [ValidateSet('Auto', 'Codex', 'Grok', 'CommandCode', 'Omp')]
    [string]$Harness = 'Auto',

    [switch]$IncludeArchived,
    [string]$WorkingDirectory,
    [string]$Title,

    [ValidateRange(1, 1000)]
    [int]$Limit = 20,

    [Parameter(Mandatory, ParameterSetName = 'Configure')]
    [string]$OutputRoot,

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$CodexFolderPrefix = 'Codex-',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$CodexFilePrefix = 'CDX_',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$GrokFolderPrefix = 'Grok-',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$GrokFilePrefix = 'Grok_',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$CommandCodeFolderPrefix = 'CommandCode-',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$CommandCodeFilePrefix = 'CommandCode_',


    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$OmpFolderPrefix = 'Omp-',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$OmpFilePrefix = 'OMP_',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$HermesFolderPrefix = 'Hermes-',

    [Parameter(ParameterSetName = 'Configure')]
    [AllowEmptyString()]
    [string]$HermesFilePrefix = 'Hermes_',

    [string]$ConfigPath = $(
        if ($env:AGENT_CHAT_ARCHIVE_CONFIG) {
            $env:AGENT_CHAT_ARCHIVE_CONFIG
        } else {
            $userRoot = $(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })
            Join-Path (Join-Path (Join-Path $userRoot '.agents') 'skills') '.agent-chat-archive.json'
        }
    ),

    [string]$CodexHome = $(
        if ($env:CODEX_HOME) { $env:CODEX_HOME }
        else { Join-Path ($(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })) '.codex' }
    ),

    [string]$GrokHome = $(
        if ($env:GROK_HOME) { $env:GROK_HOME }
        else { Join-Path ($(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })) '.grok' }
    ),

    [string]$OmpHome = $(
        if ($env:OMP_HOME) { $env:OMP_HOME }
        else { Join-Path ($(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })) '.omp' }
    ),

    [string]$CommandCodeHome = $(
        if ($env:COMMANDCODE_HOME) { $env:COMMANDCODE_HOME }
        else { Join-Path ($(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })) '.commandcode' }
    )
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Test-Property {
    param($Object, [string]$Name)
    return $null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name
}

function Resolve-LocalPath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) { throw 'Path cannot be empty.' }
    $expanded = [Environment]::ExpandEnvironmentVariables($Path.Trim())
    if ($expanded -eq '~') {
        $expanded = $(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })
    } elseif ($expanded.StartsWith('~/') -or $expanded.StartsWith('~\')) {
        $expanded = Join-Path ($(if ($env:USERPROFILE) { $env:USERPROFILE } else { [Environment]::GetFolderPath('UserProfile') })) $expanded.Substring(2)
    }
    return [IO.Path]::GetFullPath($expanded)
}

function Write-AtomicText {
    param([string]$Path, [string]$Text, [bool]$Bom = $false)

    $directory = Split-Path -Parent $Path
    [IO.Directory]::CreateDirectory($directory) | Out-Null
    $temporary = $Path + '.tmp'
    $encoding = New-Object Text.UTF8Encoding($Bom)
    [IO.File]::WriteAllText($temporary, $Text, $encoding)
    if (Test-Path -LiteralPath $Path) {
        [IO.File]::Copy($temporary, $Path, $true)
        [IO.File]::Delete($temporary)
    } else {
        Move-Item -LiteralPath $temporary -Destination $Path
    }
}

function Assert-SafePrefix {
    param([AllowEmptyString()][string]$Value, [string]$Label)

    foreach ($character in [IO.Path]::GetInvalidFileNameChars()) {
        if ($Value.Contains([string]$character)) {
            throw "$Label contains an invalid path character: '$character'."
        }
    }
}

function Save-ArchiveConfig {
    Assert-SafePrefix $CodexFolderPrefix 'Codex folder prefix'
    Assert-SafePrefix $CodexFilePrefix 'Codex file prefix'
    Assert-SafePrefix $GrokFolderPrefix 'Grok folder prefix'
    Assert-SafePrefix $GrokFilePrefix 'Grok file prefix'
    Assert-SafePrefix $CommandCodeFolderPrefix 'Command Code folder prefix'
    Assert-SafePrefix $CommandCodeFilePrefix 'Command Code file prefix'
    Assert-SafePrefix $OmpFolderPrefix 'OMP folder prefix'
    Assert-SafePrefix $OmpFilePrefix 'OMP file prefix'
    Assert-SafePrefix $HermesFolderPrefix 'Hermes folder prefix'
    Assert-SafePrefix $HermesFilePrefix 'Hermes file prefix'
    $resolvedConfig = Resolve-LocalPath $ConfigPath
    $resolvedOutput = Resolve-LocalPath $OutputRoot
    $config = [ordered]@{
        version = 1
        outputRoot = $resolvedOutput
        harnesses = [ordered]@{
            Codex = [ordered]@{
                folderPrefix = $CodexFolderPrefix
                filePrefix = $CodexFilePrefix
            }
            Grok = [ordered]@{
                folderPrefix = $GrokFolderPrefix
                filePrefix = $GrokFilePrefix
            }
            CommandCode = [ordered]@{
                folderPrefix = $CommandCodeFolderPrefix
                filePrefix = $CommandCodeFilePrefix
            }
            Omp = [ordered]@{
                folderPrefix = $OmpFolderPrefix
                filePrefix = $OmpFilePrefix
            }
            Hermes = [ordered]@{
                folderPrefix = $HermesFolderPrefix
                filePrefix = $HermesFilePrefix
            }
        }
    }
    $json = $config | ConvertTo-Json -Depth 5
    Write-AtomicText $resolvedConfig ($json + [Environment]::NewLine)
    "CONFIGURED|$resolvedConfig|root=$resolvedOutput"
}

function Get-ArchiveConfig {
    $resolvedConfig = Resolve-LocalPath $ConfigPath
    if (-not (Test-Path -LiteralPath $resolvedConfig -PathType Leaf)) {
        throw "Archive configuration not found at '$resolvedConfig'. Run -Configure after asking the user for an output root and naming preferences."
    }
    try {
        $config = Get-Content -LiteralPath $resolvedConfig -Raw -Encoding UTF8 | ConvertFrom-Json
    } catch {
        throw "Archive configuration at '$resolvedConfig' is invalid JSON: $($_.Exception.Message)"
    }
    if (-not (Test-Property $config 'version') -or [int]$config.version -ne 1) {
        throw "Unsupported archive configuration version at '$resolvedConfig'."
    }
    if (-not (Test-Property $config 'outputRoot') -or [string]::IsNullOrWhiteSpace([string]$config.outputRoot)) {
        throw "Archive configuration at '$resolvedConfig' has no outputRoot."
    }
    if (-not (Test-Property $config 'harnesses')) {
        throw "Archive configuration at '$resolvedConfig' has no harness naming settings."
    }
    if (-not (Test-Property $config.harnesses 'Hermes')) {
        $config.harnesses | Add-Member -NotePropertyName Hermes -NotePropertyValue ([pscustomobject]@{
            folderPrefix = 'Hermes-'; filePrefix = 'Hermes_'
        })
    }
    if (-not (Test-Property $config.harnesses 'Omp')) {
        $config.harnesses | Add-Member -NotePropertyName Omp -NotePropertyValue ([pscustomobject]@{
            folderPrefix = 'Omp-'; filePrefix = 'OMP_'
        })
    }
    foreach ($name in @('Codex', 'Grok', 'CommandCode', 'Omp', 'Hermes')) {
        if (-not (Test-Property $config.harnesses $name)) {
            throw "Archive configuration at '$resolvedConfig' has no '$name' settings."
        }
        $settings = $config.harnesses.$name
        if (-not (Test-Property $settings 'folderPrefix') -or -not (Test-Property $settings 'filePrefix')) {
            throw "Archive configuration at '$resolvedConfig' has incomplete '$name' settings."
        }
        Assert-SafePrefix ([string]$settings.folderPrefix) "$name folder prefix"
        Assert-SafePrefix ([string]$settings.filePrefix) "$name file prefix"
    }
    $config.outputRoot = Resolve-LocalPath ([string]$config.outputRoot)
    return $config
}

function Resolve-HarnessName {
    if ($Harness -ne 'Auto') { return $Harness }

    if ($PSCmdlet.ParameterSetName -eq 'Path') {
        $full = Resolve-LocalPath $SessionPath
        if ($full -match '[\\/]\.commandcode[\\/]') { return 'CommandCode' }
        if ($full -match '[\\/]\.grok[\\/]') { return 'Grok' }
        if ($full -match '[\\/]\.codex[\\/]') { return 'Codex' }
        if ($full -match '[\\/]\.omp[\\/]') { return 'Omp' }
    }
    if ($env:COMMANDCODE_SESSION_ID) { return 'CommandCode' }
    if ($env:GROK_SESSION_ID) { return 'Grok' }
    if ($env:CODEX_THREAD_ID) { return 'Codex' }
    if ($env:OMP_SESSION_ID) { return 'Omp' }
    throw 'Cannot detect the active harness. Pass -Harness Codex, Grok, CommandCode, or Omp.'
}

function Get-CurrentSessionId {
    param([string]$HarnessName)

    switch ($HarnessName) {
        'Codex' { return [string]$env:CODEX_THREAD_ID }
        'Grok' { return [string]$env:GROK_SESSION_ID }
        'CommandCode' { return [string]$env:COMMANDCODE_SESSION_ID }
        'Omp' { return [string]$env:OMP_SESSION_ID }
    }
}

function Convert-ToLocalDateTime {
    param($Value, [datetime]$Fallback)

    if ($null -ne $Value -and [string]$Value) {
        try {
            if ($Value -is [ValueType] -and [double]$Value -gt 100000000000) {
                return [DateTimeOffset]::FromUnixTimeMilliseconds([long]$Value).ToLocalTime().DateTime
            }
            return ([datetimeoffset]::Parse(
                [string]$Value,
                [Globalization.CultureInfo]::InvariantCulture,
                [Globalization.DateTimeStyles]::AssumeUniversal
            )).ToLocalTime().DateTime
        } catch {
            # Fall through to the file timestamp.
        }
    }
    return $Fallback
}

function Remove-InternalContext {
    param([string]$Text)

    if (-not $Text) { return '' }
    $clean = $Text
    $blockNames = @(
        'environment_context',
        'recommended_plugins',
        'permissions instructions',
        'collaboration_mode',
        'apps_instructions',
        'plugins_instructions',
        'skills_instructions'
    )
    foreach ($name in $blockNames) {
        $escaped = [regex]::Escape($name)
        $clean = [regex]::Replace($clean, "(?is)<$escaped(?:\s[^>]*)?>.*?</$escaped\s*>", '')
    }
    $clean = [regex]::Replace(
        $clean,
        '(?is)#\s*AGENTS\.md instructions\s*<INSTRUCTIONS>.*?</INSTRUCTIONS>',
        ''
    )
    return ([regex]::Replace($clean, '(\r?\n){3,}', "`r`n`r`n")).Trim()
}

function Test-InternalApprovalMessage {
    param([string]$Text)

    if (-not $Text) { return $false }
    return $Text.TrimStart() -match (
        '^The following is the Codex agent history ' +
        '(?:whose request action you are assessing|added since your last approval assessment)\.'
    )
}

function Get-ContentText {
    param($Content)

    if ($null -eq $Content) { return '' }
    if ($Content -is [string]) { return $Content }

    $parts = New-Object System.Collections.Generic.List[string]
    foreach ($item in @($Content)) {
        if ($null -eq $item) { continue }
        if ($item -is [string]) {
            $parts.Add($item)
            continue
        }
        if ((Test-Property $item 'type') -and [string]$item.type -ne 'text' -and [string]$item.type -notmatch '^(input|output)_text$') {
            continue
        }
        if ((Test-Property $item 'text') -and $item.text) {
            $parts.Add([string]$item.text)
        }
    }
    return ($parts -join "`r`n")
}

function New-SessionRecord {
    param([string]$HarnessName, [IO.FileInfo]$File)

    return [ordered]@{
        Harness = $HarnessName
        File = $File
        Id = ''
        Cwd = ''
        Started = $File.CreationTime
        Title = ''
        Messages = New-Object System.Collections.Generic.List[object]
        FallbackMessages = New-Object System.Collections.Generic.List[object]
        WarningCount = 0
        IsInternal = $false
    }
}

function Read-JsonLines {
    param([IO.FileInfo]$File, [scriptblock]$OnEvent)

    $stream = New-Object IO.FileStream(
        $File.FullName,
        [IO.FileMode]::Open,
        [IO.FileAccess]::Read,
        ([IO.FileShare]::ReadWrite -bor [IO.FileShare]::Delete)
    )
    $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::UTF8, $true)
    try {
        while (-not $reader.EndOfStream) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            try {
                $event = $line | ConvertFrom-Json
            } catch {
                & $OnEvent $null
                continue
            }
            & $OnEvent $event
        }
    } finally {
        $reader.Dispose()
        $stream.Dispose()
    }
}

function Get-HarnessHome {
    param([string]$HarnessName)

    switch ($HarnessName) {
        'Codex' { return $CodexHome }
        'Grok' { return $GrokHome }
        'CommandCode' { return $CommandCodeHome }
        'Omp' { return $OmpHome }
    }
}

function Test-CwdMatch {
    param([string]$Actual, [string]$Expected)

    if (-not $Expected) { return $true }
    if (-not $Actual) { return $false }
    try {
        $actualFull = [IO.Path]::GetFullPath($Actual).TrimEnd('\', '/')
        $expectedFull = [IO.Path]::GetFullPath($Expected).TrimEnd('\', '/')
        return $actualFull.Equals($expectedFull, [StringComparison]::OrdinalIgnoreCase)
    } catch {
        return $Actual.TrimEnd('\', '/').Equals($Expected.TrimEnd('\', '/'), [StringComparison]::OrdinalIgnoreCase)
    }
}

function Get-SafeFilePart {
    param([string]$Value, [string]$Fallback = 'Chat', [int]$MaxLength = 60)

    $safe = ([string]$Value).Trim()
    foreach ($character in [IO.Path]::GetInvalidFileNameChars()) {
        $safe = $safe.Replace([string]$character, '')
    }
    $safe = [regex]::Replace($safe, '\s+', '-')
    $safe = [regex]::Replace($safe, '-{2,}', '-').Trim('-').Trim('.')
    if (-not $safe) { $safe = $Fallback }
    if ($safe.Length -gt $MaxLength) { $safe = $safe.Substring(0, $MaxLength).Trim('-').Trim('.') }
    return $safe
}

function Get-DerivedTitle {
    param($Record)

    if ($Record.Title) { return Get-SafeFilePart $Record.Title }
    # Codex JSONL does not contain the sidebar title. The caller must pass the
    # exact UI title with -Title; never turn a potentially huge first prompt
    # into a misleading filename when that lookup was skipped.
    if ($Record.Harness -eq 'Codex') { return 'Codex-Chat' }
    $firstUser = $Record.Messages | Where-Object Role -eq 'user' | Select-Object -First 1
    if (-not $firstUser) { return 'Chat' }
    $plain = [regex]::Replace($firstUser.Text, '(?s)```.*?```', ' ')
    $plain = [regex]::Replace($plain, '<[^>]+>', ' ')
    $plain = [regex]::Replace($plain, '[#>*_`\[\]\(\)]', ' ')
    $plain = [regex]::Replace($plain, '\s+', ' ').Trim()
    return Get-SafeFilePart $plain
}

function Get-ProjectFolder {
    param($Record, $Settings)

    $leaf = ''
    if ($Record.Cwd) {
        $trimmed = $Record.Cwd.TrimEnd('\', '/')
        $leaf = Split-Path -Leaf $trimmed
        if (-not $leaf) { $leaf = $trimmed.Replace(':', '-Root') }
    }
    $safeLeaf = Get-SafeFilePart $leaf 'Unknown' 94
    return ([string]$Settings.folderPrefix) + $safeLeaf
}

function Find-ExistingExport {
    param([string]$Directory, $Record)

    if (-not $Record.Id -or -not (Test-Path -LiteralPath $Directory)) { return $null }
    $markers = @("<!-- agent-chat-archive: $($Record.Harness):$($Record.Id) -->")
    if ($Record.Harness -eq 'Codex') { $markers += "<!-- cdx-session-id: $($Record.Id) -->" }
    foreach ($file in Get-ChildItem -LiteralPath $Directory -File -Filter '*.md') {
        foreach ($marker in $markers) {
            if (Select-String -LiteralPath $file.FullName -SimpleMatch $marker -Quiet) { return $file.FullName }
        }
    }
    return $null
}

function Export-SessionRecord {
    param($Record, [string]$RequestedTitle, $Config)

    if ($Record.Messages.Count -eq 0) {
        return [pscustomobject]@{ Status = 'SKIPPED'; Path = ''; Reason = 'no-visible-messages' }
    }
    $settings = $Config.harnesses.($Record.Harness)
    $projectFolder = Get-ProjectFolder $Record $settings
    $destination = Join-Path $Config.outputRoot $projectFolder
    [IO.Directory]::CreateDirectory($destination) | Out-Null

    $chosenTitle = if ($RequestedTitle) { Get-SafeFilePart $RequestedTitle } else { Get-DerivedTitle $Record }
    $stamp = $Record.Started.ToString('yyyyMMdd_HHmmss')
    $existingPath = Find-ExistingExport $destination $Record
    $baseName = ([string]$settings.filePrefix) + $chosenTitle + '_' + $stamp
    $desiredPath = Join-Path $destination ($baseName + '.md')
    $previousPath = $null

    if ($existingPath -and -not $RequestedTitle) {
        $path = $existingPath
    } else {
        $path = $desiredPath
        $suffix = 2
        while ((Test-Path -LiteralPath $path) -and (-not $existingPath -or -not $path.Equals($existingPath, [StringComparison]::OrdinalIgnoreCase))) {
            $path = Join-Path $destination ("${baseName}_$suffix.md")
            $suffix++
        }
        if ($existingPath -and -not $path.Equals($existingPath, [StringComparison]::OrdinalIgnoreCase)) {
            $previousPath = $existingPath
        }
    }

    $culture = [Globalization.CultureInfo]::GetCultureInfo('zh-TW')
    $builder = New-Object Text.StringBuilder
    [void]$builder.AppendLine("<!-- agent-chat-archive: $($Record.Harness):$($Record.Id) -->")
    [void]$builder.AppendLine("> **對話時間**：$($Record.Started.ToString('yyyy年M月d日 tt h:mm', $culture))")
    [void]$builder.AppendLine('>')
    [void]$builder.AppendLine("> **來源 Harness**：$($Record.Harness)")
    [void]$builder.AppendLine('>')
    [void]$builder.AppendLine("> **來源資料夾**：``$($Record.Cwd)``")
    [void]$builder.AppendLine()

    $userIndex = 1
    $modelIndex = 1
    foreach ($message in $Record.Messages) {
        if ($message.Role -eq 'assistant') {
            $heading = "Model $modelIndex"
            $modelIndex++
        } else {
            $heading = "User $userIndex"
            $userIndex++
        }
        [void]$builder.AppendLine("--- [$heading] ---")
        [void]$builder.AppendLine($message.Text.Trim())
        [void]$builder.AppendLine()
    }

    Write-AtomicText $path ($builder.ToString().TrimEnd() + "`r`n") $true
    if ($previousPath -and (Test-Path -LiteralPath $previousPath)) { Remove-Item -LiteralPath $previousPath }

    return [pscustomobject]@{
        Status = 'EXPORTED'
        Path = $path
        Reason = ''
        Messages = $Record.Messages.Count
        Warnings = $Record.WarningCount
    }
}

if ($PSCmdlet.ParameterSetName -eq 'Configure') {
    Save-ArchiveConfig
    exit 0
}

if ($PSCmdlet.ParameterSetName -eq 'ShowConfig') {
    $config = Get-ArchiveConfig
    [pscustomobject]@{
        ConfigPath = Resolve-LocalPath $ConfigPath
        OutputRoot = $config.outputRoot
        CodexFolderPrefix = $config.harnesses.Codex.folderPrefix
        CodexFilePrefix = $config.harnesses.Codex.filePrefix
        GrokFolderPrefix = $config.harnesses.Grok.folderPrefix
        GrokFilePrefix = $config.harnesses.Grok.filePrefix
        CommandCodeFolderPrefix = $config.harnesses.CommandCode.folderPrefix
        CommandCodeFilePrefix = $config.harnesses.CommandCode.filePrefix
        OmpFolderPrefix = $config.harnesses.Omp.folderPrefix
        OmpFilePrefix = $config.harnesses.Omp.filePrefix
        HermesFolderPrefix = $config.harnesses.Hermes.folderPrefix
        HermesFilePrefix = $config.harnesses.Hermes.filePrefix
    }
    exit 0
}

$harnessName = Resolve-HarnessName
$adapterPath = Join-Path (Join-Path $PSScriptRoot 'harnesses') ($harnessName + '.ps1')
if (-not (Test-Path -LiteralPath $adapterPath -PathType Leaf)) {
    throw "No adapter is installed for harness '$harnessName'."
}
. $adapterPath

$candidateFiles = @()
if ($PSCmdlet.ParameterSetName -eq 'Path') {
    $candidateFiles = @((Get-Item -LiteralPath (Resolve-LocalPath $SessionPath)))
} else {
    $candidateFiles = @(Get-AgentChatSessionFiles -HarnessRoot (Get-HarnessHome $harnessName) -IncludeArchived:$IncludeArchived)
}
if ($candidateFiles.Count -eq 0) {
    throw "No $harnessName session files found."
}

$currentId = ''
if ($PSCmdlet.ParameterSetName -eq 'SessionId') {
    $candidateFiles = @($candidateFiles | Where-Object { $_.FullName -like "*$SessionId*" })
    if ($candidateFiles.Count -eq 0) { throw "No $harnessName session matched id fragment '$SessionId'." }
} elseif ($PSCmdlet.ParameterSetName -eq 'Latest') {
    $currentId = Get-CurrentSessionId $harnessName
    if ($currentId) {
        $candidateFiles = @($candidateFiles | Where-Object { $_.FullName -like "*$currentId*" })
        if ($candidateFiles.Count -eq 0) { throw "Current $harnessName session id '$currentId' has no local session file." }
    } elseif (-not $WorkingDirectory) {
        throw 'No current session id is available. Pass -WorkingDirectory or use -List and -SessionId.'
    }
}

$records = New-Object System.Collections.Generic.List[object]
foreach ($file in ($candidateFiles | Sort-Object LastWriteTime -Descending)) {
    $record = Get-AgentChatSessionRecord $file
    if (-not $record.IsInternal -and (Test-CwdMatch $record.Cwd $WorkingDirectory)) {
        $records.Add($record)
        if ($PSCmdlet.ParameterSetName -eq 'List' -and $records.Count -ge $Limit) { break }
        if ($PSCmdlet.ParameterSetName -eq 'Latest' -and -not $currentId) { break }
    }
}

if ($PSCmdlet.ParameterSetName -eq 'List') {
    $index = 1
    foreach ($record in ($records | Select-Object -First $Limit)) {
        [pscustomobject]@{
            Number = $index
            Harness = $record.Harness
            Modified = $record.File.LastWriteTime
            SessionId = $record.Id
            Cwd = $record.Cwd
            Title = Get-DerivedTitle $record
            Path = $record.File.FullName
        }
        $index++
    }
    exit 0
}

if ($PSCmdlet.ParameterSetName -eq 'SessionId') {
    $matches = @($records | Where-Object { $_.Id -like "*$SessionId*" })
    if ($matches.Count -eq 0) { throw "No $harnessName session matched id fragment '$SessionId'." }
    if ($matches.Count -gt 1) {
        $exact = @($matches | Where-Object Id -eq $SessionId)
        if ($exact.Count -ne 1) { throw "Session id fragment '$SessionId' is ambiguous; use the complete id." }
        $records = $exact
    } else {
        $records = $matches
    }
} elseif ($PSCmdlet.ParameterSetName -eq 'Latest') {
    if ($currentId) {
        $current = @($records | Where-Object Id -eq $currentId)
        if ($current.Count -ne 1) { throw "Current $harnessName session id '$currentId' did not match exactly one local session." }
        $records = $current
    } else {
        if ($records.Count -eq 0) { throw "No $harnessName session matched working directory '$WorkingDirectory'." }
        $records = @($records | Sort-Object { $_.File.LastWriteTime } -Descending | Select-Object -First 1)
    }
}

if ($records.Count -eq 0) {
    throw "No $harnessName session matched working directory '$WorkingDirectory'."
}
if ($Title -and $records.Count -gt 1) {
    throw '-Title can only be used when exporting one session.'
}

$config = Get-ArchiveConfig
$exported = 0
$skipped = 0
$keepSync = Join-Path $env:USERPROFILE '.local\bin\ccusage-keep-sync.py'
$keepPy = Join-Path $env:LOCALAPPDATA 'Programs\Python\Python313\python.exe'
if ((Test-Path -LiteralPath $keepSync) -and (Test-Path -LiteralPath $keepPy)) {
    & $keepPy $keepSync | Out-Null
    if ($LASTEXITCODE -ne 0) { "WARN|ccusage-keep sync failed" }
}
foreach ($record in $records) {
    $result = Export-SessionRecord $record $Title $config
    if ($result.Status -eq 'EXPORTED') {
        $exported++
        "EXPORTED|$($result.Path)|messages=$($result.Messages)|warnings=$($result.Warnings)"
    } else {
        $skipped++
        "SKIPPED|$($record.File.FullName)|$($result.Reason)"
    }
}
"SUMMARY|harness=$harnessName|exported=$exported|skipped=$skipped|root=$($config.outputRoot)"
