[CmdletBinding()]
param()

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

function Write-JsonLines {
    param([string]$Path, [object[]]$Values)

    [IO.Directory]::CreateDirectory((Split-Path -Parent $Path)) | Out-Null
    $lines = foreach ($value in $Values) { $value | ConvertTo-Json -Depth 10 -Compress }
    [IO.File]::WriteAllLines($Path, $lines, (New-Object Text.UTF8Encoding($false)))
}

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "ASSERT FAILED: $Message" }
    $script:checks++
}

$script:checks = 0
$testRoot = Join-Path ([IO.Path]::GetTempPath()) ('agent-chat-archive-' + [guid]::NewGuid().ToString('N'))
$resolvedTemp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$resolvedTest = [IO.Path]::GetFullPath($testRoot)
if (-not $resolvedTest.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Test root escaped the system temporary directory.'
}

try {
    $exporter = Join-Path $PSScriptRoot 'Export-AgentChat.ps1'
    $outputRoot = Join-Path $testRoot 'output'
    $configPath = Join-Path $testRoot 'config.json'
    & $exporter -Configure -ConfigPath $configPath -OutputRoot $outputRoot | Out-Null

    $codexId = '11111111-1111-4111-8111-111111111111'
    $codexHome = Join-Path $testRoot 'codex'
    $codexPath = Join-Path $codexHome "sessions\2026\08\rollout-$codexId.jsonl"
    Write-JsonLines $codexPath @(
        [ordered]@{ timestamp = '2026-08-13T01:00:00Z'; type = 'session_meta'; payload = [ordered]@{ id = $codexId; cwd = 'C:\Work\CodexRepo'; timestamp = '2026-08-13T01:00:00Z' } },
        [ordered]@{ timestamp = '2026-08-13T01:00:01Z'; type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'user'; content = @([ordered]@{ type = 'input_text'; text = 'Codex visible <environment_context>secret</environment_context>' }) } },
        [ordered]@{ timestamp = '2026-08-13T01:00:02Z'; type = 'response_item'; payload = [ordered]@{ type = 'function_call'; name = 'secret-tool' } },
        [ordered]@{ timestamp = '2026-08-13T01:00:03Z'; type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'assistant'; content = @([ordered]@{ type = 'output_text'; text = 'Codex reply' }) } }
    )
    $codexResult = @(& $exporter -Harness Codex -SessionPath $codexPath -ConfigPath $configPath -Title 'Codex Test')
    $codexExport = ($codexResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($codexExport -like '*\Codex-CodexRepo\CDX_Codex-Test_*.md') 'Codex naming profile mismatch'
    $codexText = Get-Content -LiteralPath $codexExport -Raw -Encoding UTF8
    Assert-True ($codexText -match 'Codex visible' -and $codexText -match 'Codex reply') 'Codex visible messages missing'
    Assert-True ($codexText -notmatch 'secret|secret-tool') 'Codex internal content leaked'

    $grokId = '22222222-2222-4222-8222-222222222222'
    $grokHome = Join-Path $testRoot 'grok'
    $grokDir = Join-Path $grokHome "sessions\encoded\$grokId"
    $grokPath = Join-Path $grokDir 'chat_history.jsonl'
    Write-JsonLines $grokPath @(
        [ordered]@{ type = 'system'; content = 'Grok system secret' },
        [ordered]@{ type = 'user'; content = [ordered]@{ type = 'text'; text = 'Grok injected secret' }; synthetic_reason = 'system_reminder' },
        [ordered]@{ type = 'user'; content = [ordered]@{ type = 'text'; text = 'Grok visible' }; prompt_index = 0 },
        [ordered]@{ type = 'reasoning'; summary = [ordered]@{ type = 'summary_text'; text = 'Grok reasoning secret' } },
        [ordered]@{ type = 'assistant'; content = 'Grok reply' },
        [ordered]@{ type = 'tool_result'; content = 'Grok tool secret' }
    )
    [IO.Directory]::CreateDirectory($grokDir) | Out-Null
    [IO.File]::WriteAllText(
        (Join-Path $grokDir 'summary.json'),
        ([ordered]@{
            info = [ordered]@{ id = $grokId; cwd = 'C:\Work\GrokRepo' }
            created_at = '2026-08-13T02:00:00Z'
            generated_title = 'Grok Test'
        } | ConvertTo-Json -Depth 5),
        (New-Object Text.UTF8Encoding($false))
    )
    $grokResult = @(& $exporter -Harness Grok -SessionPath $grokPath -ConfigPath $configPath)
    $grokExport = ($grokResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($grokExport -like '*\Grok-GrokRepo\Grok_Grok-Test_*.md') 'Grok naming profile mismatch'
    $grokText = Get-Content -LiteralPath $grokExport -Raw -Encoding UTF8
    Assert-True ($grokText -match 'Grok visible' -and $grokText -match 'Grok reply') 'Grok visible messages missing'
    Assert-True ($grokText -notmatch 'secret') 'Grok internal content leaked'

    $commandId = '33333333-3333-4333-8333-333333333333'
    $commandHome = Join-Path $testRoot 'commandcode'
    $commandDir = Join-Path $commandHome 'projects\command-repo'
    $commandPath = Join-Path $commandDir "$commandId.jsonl"
    Write-JsonLines $commandPath @(
        [ordered]@{ type = 'session'; version = 3; id = $commandId; timestamp = '2026-08-13T03:00:00Z'; cwd = 'C:\Work\CommandRepo' },
        [ordered]@{ type = 'message'; id = 'u1'; parentId = $null; timestamp = '2026-08-13T03:00:01Z'; message = [ordered]@{ role = 'user'; content = [ordered]@{ type = 'text'; text = 'Command visible' } } },
        [ordered]@{ type = 'message'; id = 'a1'; parentId = 'u1'; timestamp = '2026-08-13T03:00:02Z'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'thinking'; thinking = 'Command reasoning secret' }, [ordered]@{ type = 'text'; text = 'Command reply' }) } },
        [ordered]@{ type = 'message'; id = 'u2'; parentId = 'a1'; timestamp = '2026-08-13T03:00:03Z'; message = [ordered]@{ role = 'user'; content = [ordered]@{ type = 'tool_result'; content = [ordered]@{ type = 'text'; text = 'Command tool secret' } } } },
        [ordered]@{ type = 'message'; id = 'a2'; parentId = 'u2'; timestamp = '2026-08-13T03:00:04Z'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Command final' }) } }
    )
    [IO.File]::WriteAllText(
        (Join-Path $commandDir "$commandId.meta.json"),
        ([ordered]@{ title = 'Command Test'; model = 'test' } | ConvertTo-Json),
        (New-Object Text.UTF8Encoding($false))
    )
    $commandResult = @(& $exporter -Harness CommandCode -SessionPath $commandPath -ConfigPath $configPath)
    $commandExport = ($commandResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($commandExport -like '*\CommandCode-CommandRepo\CommandCode_Command-Test_*.md') 'Command Code naming profile mismatch'
    $commandText = Get-Content -LiteralPath $commandExport -Raw -Encoding UTF8
    Assert-True ($commandText -match 'Command visible' -and $commandText -match 'Command reply' -and $commandText -match 'Command final') 'Command Code visible messages missing'
    Assert-True ($commandText -notmatch 'secret') 'Command Code internal content leaked'
    $ompId = '20260813T040000Z_test'
    $ompHome = Join-Path $testRoot 'omp'
    $ompDir = Join-Path $ompHome 'agent\sessions\--C--Work-OmpRepo--'
    $ompPath = Join-Path $ompDir "$ompId.jsonl"
    Write-JsonLines $ompPath @(
        [ordered]@{ type = 'title_change'; timestamp = '2026-08-13T04:00:00Z'; title = 'Omp Test' },
        [ordered]@{ type = 'session'; version = 3; id = $ompId; timestamp = '2026-08-13T04:00:00Z'; cwd = 'C:\Work\OmpRepo' },
        [ordered]@{ type = 'message'; timestamp = '2026-08-13T04:00:01Z'; message = [ordered]@{ role = 'user'; content = @([ordered]@{ type = 'text'; text = 'OMP visible' }) } },
        [ordered]@{ type = 'message'; timestamp = '2026-08-13T04:00:02Z'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'thinking'; thinking = 'OMP reasoning secret' }, [ordered]@{ type = 'text'; text = 'OMP reply' }) } },
        [ordered]@{ type = 'custom_message'; customType = 'skill-prompt'; content = 'OMP injected secret' }
    )
    $ompResult = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath)
    $ompExport = ($ompResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($ompExport -like '*\Omp-OmpRepo\OMP_Omp-Test_*.md') 'OMP naming profile mismatch'
    $ompText = Get-Content -LiteralPath $ompExport -Raw -Encoding UTF8
    Assert-True ($ompText -match 'OMP visible' -and $ompText -match 'OMP reply') 'OMP visible messages missing'
    Assert-True ($ompText -notmatch 'secret') 'OMP internal content leaked'

    $customConfig = Join-Path $testRoot 'custom-config.json'
    & $exporter -Configure -ConfigPath $customConfig -OutputRoot (Join-Path $testRoot 'custom-output') `
        -CodexFolderPrefix '' -CodexFilePrefix '' -GrokFolderPrefix '' -GrokFilePrefix '' `
        -CommandCodeFolderPrefix '' -CommandCodeFilePrefix '' | Out-Null
    $custom = Get-Content -LiteralPath $customConfig -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True ([string]$custom.harnesses.Hermes.folderPrefix -eq 'Hermes-' -and [string]$custom.harnesses.Hermes.filePrefix -eq 'Hermes_') 'Hermes naming profile missing'
    Assert-True ([string]$custom.harnesses.Omp.folderPrefix -eq 'Omp-' -and [string]$custom.harnesses.Omp.filePrefix -eq 'OMP_') 'OMP naming profile missing'

    $unsafeRejected = $false
    $savedUserProfile = $env:USERPROFILE
    $savedCodexHome = $env:CODEX_HOME
    $savedArchiveConfig = $env:AGENT_CHAT_ARCHIVE_CONFIG
    try {
        $defaultProfile = Join-Path $testRoot 'default-profile'
        $defaultId = '44444444-4444-4444-8444-444444444444'
        $defaultSession = Join-Path $defaultProfile ".codex\sessions\2026\08\rollout-$defaultId.jsonl"
        Write-JsonLines $defaultSession @(
            [ordered]@{ timestamp = '2026-08-13T04:00:00Z'; type = 'session_meta'; payload = [ordered]@{ id = $defaultId; cwd = 'C:\Work\DefaultRepo'; timestamp = '2026-08-13T04:00:00Z' } },
            [ordered]@{ timestamp = '2026-08-13T04:00:01Z'; type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'user'; content = @([ordered]@{ type = 'input_text'; text = 'Default profile visible' }) } },
            [ordered]@{ timestamp = '2026-08-13T04:00:02Z'; type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'assistant'; content = @([ordered]@{ type = 'output_text'; text = 'Default profile reply' }) } }
        )
        $env:USERPROFILE = $defaultProfile
        $env:CODEX_HOME = $null
        $env:AGENT_CHAT_ARCHIVE_CONFIG = $null
        & $exporter -Configure -OutputRoot (Join-Path $testRoot 'default-output') | Out-Null
        $defaultResult = @(& $exporter -Harness Codex -SessionId $defaultId -Title 'Default Profile')
        $defaultExport = ($defaultResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
        $defaultText = Get-Content -LiteralPath $defaultExport -Raw -Encoding UTF8
        Assert-True ($defaultText -match 'Default profile visible' -and $defaultText -match 'Default profile reply') 'default USERPROFILE session messages missing'
    } finally {
        $env:USERPROFILE = $savedUserProfile
        $env:CODEX_HOME = $savedCodexHome
        $env:AGENT_CHAT_ARCHIVE_CONFIG = $savedArchiveConfig
    }
    try {
        & $exporter -Configure -ConfigPath (Join-Path $testRoot 'unsafe.json') -OutputRoot $outputRoot -GrokFolderPrefix '..\escape' | Out-Null
    } catch {
        $unsafeRejected = $true
    }
    Assert-True $unsafeRejected 'unsafe folder prefix was accepted'

    "SELF_TEST_OK checks=$script:checks"
} finally {
    if ((Test-Path -LiteralPath $resolvedTest) -and $resolvedTest.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedTest -Recurse -Force
    }
}
