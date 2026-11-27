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

    $headingBody = (@('# Body', '````md', '# fenced', '```', '# still fenced', '````', '~~~text', '# tilde', '~~~', '    # indented', '# End') -join "`n")
    Write-JsonLines $codexPath @(
        [ordered]@{ timestamp = '2026-08-13T01:00:00Z'; type = 'session_meta'; payload = [ordered]@{ id = $codexId; cwd = 'C:\Work\CodexRepo'; timestamp = '2026-08-13T01:00:00Z' } },
        [ordered]@{ type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'user'; content = @([ordered]@{ type = 'input_text'; text = $headingBody }) } },
        [ordered]@{ type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'assistant'; content = @([ordered]@{ type = 'output_text'; text = '# Answer' }) } },
        [ordered]@{ type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'assistant'; content = @([ordered]@{ type = 'output_text'; text = 'Second answer' }) } },
        [ordered]@{ type = 'response_item'; payload = [ordered]@{ type = 'message'; role = 'user'; content = @([ordered]@{ type = 'input_text'; text = 'Second prompt' }) } }
    )
    $headingResult = @(& $exporter -Harness Codex -SessionPath $codexPath -ConfigPath $configPath)
    $headingText = Get-Content -LiteralPath $codexExport -Raw -Encoding UTF8
    $expectedBody = $headingBody.Replace('# Body', '## Body').Replace('# End', '## End')
    Assert-True ($headingText.Contains("# User 1`r`n`r`n$expectedBody")) 'Body heading demotion changed fenced or indented code'
    Assert-True ($headingText.Contains("# Model 1`r`n`r`n## Answer") -and $headingText.Contains("# Model 2`r`n`r`nSecond answer") -and $headingText.Contains("# User 2`r`n`r`nSecond prompt")) 'Role numbering or blank separator line mismatch'
    Assert-True (($headingText -split '# User 1', 2)[0] -ceq ($codexText -split '# User 1', 2)[0]) 'Heading cutover changed archive metadata'

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
    Assert-True ($ompExport -like '*\Omp-OmpRepo\OMP_Omp-Test_*\conversation.md') 'OMP bundle conversation path mismatch'
    $ompText = Get-Content -LiteralPath $ompExport -Raw -Encoding UTF8
    Assert-True ($ompText -match 'OMP visible' -and $ompText -match 'OMP reply') 'OMP visible messages missing'
    Assert-True ($ompText -notmatch 'secret') 'OMP internal content leaked'
    # Windows PowerShell 5.1 reads a BOM-less script as the ANSI code page and garbles the CJK header.
    Assert-True ($ompText -match '> \*\*\u5c0d\u8a71\u6642\u9593\*\*\uff1a\d{4}\u5e74' -and -not $ompText.Contains('@{Harness=')) 'Archive header garbled (exporter must be saved as UTF-8 with BOM)'
    $ompBundle = Split-Path -Parent $ompExport
    $ompManifestPath = Join-Path $ompBundle 'manifest.json'
    $ompManifest = Get-Content -LiteralPath $ompManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True ($ompManifest.sessionId -eq $ompId -and $ompManifest.status -eq 'complete') 'OMP manifest identity or completion status mismatch'
    $ompFiles = @($ompResult | Where-Object { $_ -like 'FILE|*' } | ForEach-Object { $_ -replace '^FILE\|', '' })
    Assert-True ($ompFiles.Count -eq 2 -and @($ompFiles | Where-Object { -not [IO.Path]::IsPathRooted($_) -or -not (Test-Path -LiteralPath $_) }).Count -eq 0) 'OMP bundle file paths missing or not absolute'

    $ompChildRoot = Join-Path $ompDir $ompId
    $childAId = '77777777-7777-4777-8777-777777777777'
    $childBId = '88888888-8888-4888-8888-888888888888'
    $childCId = '99999999-9999-4999-8999-999999999999'
    $rootTask = [ordered]@{ type = 'message'; timestamp = '2026-08-13T04:00:03Z'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'toolCall'; id = 'call-a'; name = 'task'; arguments = [ordered]@{ tasks = @([ordered]@{ name = 'AgentA'; task = 'inspect A' }, [ordered]@{ name = 'AgentB'; task = 'inspect B' }, [ordered]@{ name = 'AgentC'; task = 'inspect root C' }) } }) } }
    $rootResult = [ordered]@{ type = 'message'; timestamp = '2026-08-13T04:00:04Z'; message = [ordered]@{ role = 'toolResult'; toolName = 'task'; toolCallId = 'call-a'; details = [ordered]@{ progress = @([ordered]@{ id = $childAId; status = 'completed' }, [ordered]@{ id = 'AgentB'; status = 'completed' }, [ordered]@{ id = 'AgentC'; status = 'completed' }) } } }
    Write-JsonLines $ompPath @(
        [ordered]@{ type = 'session'; version = 3; id = $ompId; timestamp = '2026-08-13T04:00:00Z'; cwd = 'C:\Work\OmpRepo' },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Root user text' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'thinking'; thinking = 'private root reasoning' }, [ordered]@{ type = 'text'; text = 'Root assistant text' }) } },
        $rootTask, $rootResult
    )
    $childAPath = Join-Path $ompChildRoot 'AgentA.jsonl'
    $rootCPath = Join-Path $ompChildRoot 'AgentC.jsonl'
    $childCPath = Join-Path (Join-Path $ompChildRoot 'AgentA') 'AgentC.jsonl'
    Write-JsonLines $childAPath @(
        [ordered]@{ type = 'session'; version = 3; id = $childAId; timestamp = '2026-08-13T04:01:00Z'; cwd = 'C:\Work\OmpRepo'; parentSession = $ompPath },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Child A task text' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Child A answer' }); stopReason = 'stop' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'toolCall'; id = 'call-c'; name = 'task'; arguments = [ordered]@{ tasks = @([ordered]@{ name = 'AgentC'; task = 'inspect C' }) } }) } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Delegated task complete' }); stopReason = 'stop' } }
    )
    Write-JsonLines $rootCPath @(
        [ordered]@{ type = 'session'; version = 3; id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'; timestamp = '2026-08-13T04:02:30Z'; cwd = 'C:\Work\OmpRepo'; parentSession = $ompPath },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Root AgentC task' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Root AgentC answer' }); stopReason = 'stop' } }
    )
    Write-JsonLines $childCPath @(
        [ordered]@{ type = 'session'; version = 3; id = $childCId; timestamp = '2026-08-13T04:02:00Z'; cwd = 'C:\Work\OmpRepo'; parentSession = $childAPath },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Nested child task' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Nested child answer' }); stopReason = 'stop' } }
    )
    $nestedResult = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath)
    $nestedExport = ($nestedResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $nestedBundle = Split-Path -Parent $nestedExport
    $nestedManifest = Get-Content -LiteralPath (Join-Path $nestedBundle 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $missingChild = @($nestedManifest.subagents | Where-Object { $_.name -eq 'AgentB' })[0]
    Assert-True ($missingChild.status -eq 'partial' -and -not $missingChild.path -and $nestedManifest.warnings.Count -gt 0) 'OMP missing child was not reported as an unresolved warning'
    Assert-True ([bool](@($nestedResult) -match 'completeness=partial') -and [bool](@($nestedResult) -match 'SUMMARY\|.*partial=1')) 'OMP partial status was not exposed in CLI output'
    Assert-True ($nestedManifest.status -eq 'partial' -and @($nestedManifest.subagents).Count -eq 4) 'OMP missing referenced child did not produce partial bundle with saved children'
    $childAEntry = @($nestedManifest.subagents | Where-Object { $_.id -eq $childAId })[0]
    $childCEntry = @($nestedManifest.subagents | Where-Object { $_.id -eq $childCId })[0]
    $rootCEntry = @($nestedManifest.subagents | Where-Object { $_.id -eq 'cccccccc-cccc-4ccc-8ccc-cccccccccccc' })[0]
    Assert-True ($childAEntry.parentId -eq $ompId -and $childCEntry.parentId -eq $childAId -and $rootCEntry.parentId -eq $ompId) 'OMP nested or duplicate-name parent identity was not preserved'
    $childAText = Get-Content -LiteralPath (Join-Path $nestedBundle $childAEntry.path) -Raw -Encoding UTF8
    $childCText = Get-Content -LiteralPath (Join-Path $nestedBundle $childCEntry.path) -Raw -Encoding UTF8
    $conversationText = Get-Content -LiteralPath $nestedExport -Raw -Encoding UTF8
    Assert-True ($conversationText -match [regex]::Escape($childAEntry.path) -and $conversationText -match 'Unresolved items') 'OMP subagent index link or unresolved warning missing'
    Assert-True ($childAText -match 'Parent session ID' -and $childAText -match [regex]::Escape($ompId) -and $childAText -match 'Child A task text' -and $childAText -match 'Child A answer' -and $childCText -match 'Nested child answer') 'OMP child transcript omitted visible content or parent identity'
    Assert-True ($childAText -notmatch 'private|toolCall|arguments') 'OMP child transcript leaked internal content'
    $goodAttachment = Join-Path $nestedBundle $childAEntry.path
    [IO.File]::WriteAllText($childAPath, "{malformed`n", (New-Object Text.UTF8Encoding($false)))
    $preserveResult = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath)
    $preserveExport = ($preserveResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $preserveBundle = Split-Path -Parent $preserveExport
    Assert-True (Test-Path -LiteralPath $goodAttachment) 'OMP malformed re-export deleted previously saved good attachment'
    $preservedText = Get-Content -LiteralPath $goodAttachment -Raw -Encoding UTF8
    Assert-True ($preservedText -match 'Child A answer') 'OMP malformed re-export replaced good attachment content'
    $damagedManifest = Get-Content -LiteralPath (Join-Path $preserveBundle 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $damagedNested = @($damagedManifest.subagents | Where-Object id -eq $childCId)[0]
    Assert-True ($damagedNested.parentId -eq $childAId -and $damagedNested.path -eq $childCEntry.path) 'OMP malformed parent changed nested child identity or attachment'
    Assert-True ((Get-Content -LiteralPath (Join-Path $preserveBundle $rootCEntry.path) -Raw -Encoding UTF8) -match 'Root AgentC answer') 'OMP malformed parent caused duplicate-name attachment overwrite'
    Remove-Item -LiteralPath $childAPath
    $missingResult = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath)
    $missingExport = ($missingResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $missingManifest = Get-Content -LiteralPath (Join-Path (Split-Path $missingExport) 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $missingNested = @($missingManifest.subagents | Where-Object id -eq $childCId)[0]
    Assert-True ($missingManifest.status -eq 'partial' -and $missingNested.parentId -eq $childAId -and $missingNested.path -eq $childCEntry.path) 'OMP missing parent changed nested child relationship'
    Assert-True ((Get-Content -LiteralPath $goodAttachment -Raw -Encoding UTF8) -match 'Child A answer') 'OMP missing source lost last good attachment'
    $renameResult = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath -Title 'Renamed OMP')
    $renameExport = ($renameResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($renameExport -like '*\OMP_Renamed-OMP_*\conversation.md') 'OMP title rename did not rename bundle'
    Assert-True ((Get-ChildItem -LiteralPath (Split-Path -Parent $renameExport) -Recurse -File -Filter '*.md').Count -ge 2) 'OMP title rename lost existing attachments'
    $sameIdResult = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath)
    $sameIdExport = ($sameIdResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($sameIdExport -eq $renameExport) 'OMP ID-based re-export changed the renamed bundle path'
    $ompCopies = @(Get-ChildItem -LiteralPath $outputRoot -Recurse -File -Filter 'conversation.md' | Where-Object { Select-String -LiteralPath $_.FullName -SimpleMatch "<!-- agent-chat-archive: Omp:$ompId -->" -Quiet })
    Assert-True ($ompCopies.Count -eq 1) 'OMP ID-based re-export created duplicate bundles'

    $unfinishedId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    $unfinishedRoot = Join-Path $ompDir 'unfinished.jsonl'
    Write-JsonLines $unfinishedRoot @(
        [ordered]@{ type = 'session'; version = 3; id = $unfinishedId; timestamp = '2026-08-13T04:03:00Z'; cwd = 'C:\Work\OmpRepo' },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Unfinished root visible prompt' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'toolCall'; id = 'call-pending'; name = 'task'; arguments = [ordered]@{ tasks = @([ordered]@{ name = 'PendingAgent'; task = 'pending task' }) } }) } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'toolResult'; toolName = 'task'; toolCallId = 'call-pending'; details = [ordered]@{ progress = @([ordered]@{ id = 'PendingAgent'; status = 'pending' }) } } }
    )
    $pendingChildPath = Join-Path (Join-Path $ompDir 'unfinished') 'PendingAgent.jsonl'
    Write-JsonLines $pendingChildPath @(
        [ordered]@{ type = 'session'; version = 3; id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'; timestamp = '2026-08-13T04:04:00Z'; cwd = 'C:\Work\OmpRepo'; parentSession = $unfinishedRoot },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Pending child task text' } },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Pending child partial answer' }) } }
    )
    $unfinishedResult = @(& $exporter -Harness Omp -SessionPath $unfinishedRoot -ConfigPath $configPath)
    $unfinishedExport = ($unfinishedResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $unfinishedManifest = Get-Content -LiteralPath (Join-Path (Split-Path -Parent $unfinishedExport) 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $pendingEntry = @($unfinishedManifest.subagents | Where-Object { $_.name -eq 'PendingAgent' })[0]
    Assert-True ($unfinishedManifest.status -eq 'partial' -and $pendingEntry.status -eq 'partial') 'OMP unfinished child was marked complete'
    Assert-True ($pendingEntry.path -and (Get-Content -LiteralPath (Join-Path (Split-Path -Parent $unfinishedExport) $pendingEntry.path) -Raw -Encoding UTF8) -match 'Pending child task text') 'OMP unfinished first export discarded available child task text'

    $legacyId = '20260813T050000Z_legacy'
    $legacyOmpPath = Join-Path $ompDir "$legacyId.jsonl"
    Write-JsonLines $legacyOmpPath @(
        [ordered]@{ type = 'session'; version = 3; id = $legacyId; timestamp = '2026-08-13T05:00:00Z'; cwd = 'C:\Work\OmpRepo' },
        [ordered]@{ type = 'message'; message = [ordered]@{ role = 'user'; content = 'Legacy visible text' } }
    )
    $legacyFlat = Join-Path $outputRoot 'Omp-OmpRepo\OMP_Legacy_20260813_050000.md'
    [IO.Directory]::CreateDirectory((Split-Path -Parent $legacyFlat)) | Out-Null
    [IO.File]::WriteAllText($legacyFlat, "<!-- agent-chat-archive: Omp:$legacyId -->`nLegacy visible text`n", (New-Object Text.UTF8Encoding($false)))
    $legacyOmpResult = @(& $exporter -Harness Omp -SessionPath $legacyOmpPath -ConfigPath $configPath)
    $legacyOmpExport = ($legacyOmpResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($legacyOmpExport -like '*\conversation.md' -and (Test-Path -LiteralPath (Split-Path -Parent $legacyOmpExport))) 'OMP legacy flat export did not migrate to bundle'
    Assert-True (-not (Test-Path -LiteralPath $legacyFlat)) 'OMP legacy flat export remained after successful migration'
    Assert-True ((Get-Content -LiteralPath $legacyOmpExport -Raw -Encoding UTF8) -match 'Legacy visible text') 'OMP migrated transcript lost visible content'

    $claudeId = '55555555-5555-4555-8555-555555555555'
    $subId = '66666666-6666-4666-8666-666666666666'
    $claudeHome = Join-Path $testRoot '.claude'
    $claudeDir = Join-Path $claudeHome 'projects\claude-repo'
    $claudePath = Join-Path $claudeDir "$claudeId.jsonl"
    Write-JsonLines $claudePath @(
        [ordered]@{ type = 'custom-title'; customTitle = 'Claude Test'; timestamp = '2026-08-13T05:00:00Z'; sessionId = $claudeId; cwd = 'C:\Work\ClaudeRepo' },
        [ordered]@{ type = 'user'; uuid = 'u1'; parentUuid = $null; timestamp = '2026-08-13T05:00:01Z'; sessionId = $claudeId; cwd = 'C:\Work\ClaudeRepo'; isMeta = $false; isSidechain = $false; message = [ordered]@{ role = 'user'; content = 'Claude visible <system-reminder>reminder secret</system-reminder>' } },
        [ordered]@{ type = 'assistant'; uuid = 'a1'; parentUuid = 'u1'; timestamp = '2026-08-13T05:00:02Z'; sessionId = $claudeId; message = [ordered]@{ id = 'msg_a'; role = 'assistant'; content = @([ordered]@{ type = 'thinking'; thinking = 'thinking secret' }, [ordered]@{ type = 'text'; text = 'partial secret' }) } },
        [ordered]@{ type = 'user'; uuid = 'abandoned'; parentUuid = 'u1'; timestamp = '2026-08-13T05:00:03Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = 'abandoned secret' } },
        [ordered]@{ type = 'assistant'; uuid = 'a1b'; parentUuid = 'a1'; timestamp = '2026-08-13T05:00:04Z'; sessionId = $claudeId; message = [ordered]@{ id = 'msg_a'; role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Claude reply' }, [ordered]@{ type = 'tool_use'; name = 'secret-tool'; input = [ordered]@{ path = 'secret' } }) } },
        [ordered]@{ type = 'user'; uuid = 'side'; parentUuid = 'a1b'; isSidechain = $true; timestamp = '2026-08-13T05:00:05Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = 'side secret' } },
        [ordered]@{ type = 'user'; uuid = 'meta'; parentUuid = 'a1b'; isMeta = $true; timestamp = '2026-08-13T05:00:06Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = 'meta secret' } },
        [ordered]@{ type = 'user'; uuid = 'tool'; parentUuid = 'a1b'; timestamp = '2026-08-13T05:00:07Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = @([ordered]@{ type = 'tool_result'; content = 'tool secret' }) } },
        [ordered]@{ type = 'user'; uuid = 'ucmd'; parentUuid = 'tool'; timestamp = '2026-08-13T05:00:08Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = '<command-name>/archive</command-name><command-args>now</command-args>injected skill secret' } },
        [ordered]@{ type = 'assistant'; uuid = 'a2'; parentUuid = 'ucmd'; timestamp = '2026-08-13T05:00:09Z'; sessionId = $claudeId; message = [ordered]@{ id = 'msg_b'; role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Claude final' }) } },
        [ordered]@{ type = 'attachment'; uuid = 'att'; parentUuid = 'a2'; timestamp = '2026-08-13T05:00:10Z'; sessionId = $claudeId; attachment = [ordered]@{ type = 'edited_text_file'; content = 'attachment secret' } },
        [ordered]@{ type = 'user'; uuid = 'u3'; parentUuid = 'att'; timestamp = '2026-08-13T05:00:11Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = 'Claude after attachment' } },
        [ordered]@{ type = 'assistant'; uuid = 'a3'; parentUuid = 'u3'; timestamp = '2026-08-13T05:00:12Z'; sessionId = $claudeId; message = [ordered]@{ id = 'msg_c'; role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Claude block one' }) } },
        [ordered]@{ type = 'assistant'; uuid = 'a3b'; parentUuid = 'a3'; timestamp = '2026-08-13T05:00:13Z'; sessionId = $claudeId; message = [ordered]@{ id = 'msg_c'; role = 'assistant'; content = @([ordered]@{ type = 'tool_use'; name = 'secret-tool'; input = [ordered]@{ path = 'secret' } }) } },
        [ordered]@{ type = 'user'; uuid = 'tool2'; parentUuid = 'a3b'; timestamp = '2026-08-13T05:00:14Z'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = @([ordered]@{ type = 'tool_result'; content = 'tool secret' }) } },
        [ordered]@{ type = 'assistant'; uuid = 'a4'; parentUuid = 'tool2'; timestamp = '2026-08-13T05:00:15Z'; sessionId = $claudeId; message = [ordered]@{ id = 'msg_d'; role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Claude block two' }) } },
        [ordered]@{ type = 'queue-operation'; timestamp = '2026-08-14T00:00:00Z'; sessionId = $claudeId }
    )
    Write-JsonLines (Join-Path $claudeDir "$claudeId\subagents\$subId.jsonl") @(
        [ordered]@{ type = 'user'; uuid = 'sub'; parentUuid = $null; sessionId = $subId; cwd = 'C:\Work\ClaudeRepo'; message = [ordered]@{ role = 'user'; content = 'subagent secret' } }
    )
    $claudeResult = @(& $exporter -SessionPath $claudePath -ConfigPath $configPath)
    $claudeExport = ($claudeResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($claudeExport -like '*\Claude-ClaudeRepo\Claude_Claude-Test_*.md') 'Claude naming profile mismatch'
    $claudeText = Get-Content -LiteralPath $claudeExport -Raw -Encoding UTF8
    Assert-True ($claudeText -match 'Claude visible' -and $claudeText -match 'Claude reply' -and $claudeText -match '/archive now' -and $claudeText -match 'Claude final') 'Claude visible messages missing'
    Assert-True ($claudeText -notmatch 'secret') 'Claude internal content leaked'
    Assert-True ($claudeText -match 'Claude after attachment' -and $claudeText -match '(?s)Claude block one\s+Claude block two') 'Claude per-block text or attachment-linked chain missing'
    Assert-True ($claudeText -match '2026\u5e748\u670813\u65e5') 'Claude start time not taken from first conversation event'
    Assert-True ([bool](@($claudeResult) -match 'messages=6')) 'Claude visible message count mismatch'
    $claudeList = @(& $exporter -Harness Claude -List -ClaudeHome $claudeHome -WorkingDirectory 'C:\Work\ClaudeRepo')
    Assert-True (@($claudeList | Select-Object -ExpandProperty SessionId) -contains $claudeId) 'Claude session missing from list'
    Assert-True (-not (@($claudeList | Select-Object -ExpandProperty SessionId) -contains $subId)) 'Claude subagent transcript listed'
    $legacyPath = Join-Path $testRoot 'legacy-config.json'
    $legacy = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $legacy.harnesses.PSObject.Properties.Remove('Claude')
    [IO.File]::WriteAllText($legacyPath, (($legacy | ConvertTo-Json -Depth 5) + "`n"), (New-Object Text.UTF8Encoding($false)))
    $legacyResult = @(& $exporter -Harness Claude -SessionPath $claudePath -ConfigPath $legacyPath)
    Assert-True ([bool](@($legacyResult) -match '^EXPORTED\|')) 'legacy config missing Claude settings was rejected'

    $claudeAgentDir = Join-Path $claudeDir "$claudeId\subagents"
    Write-JsonLines (Join-Path $claudeAgentDir 'agent-aaa111.jsonl') @(
        [ordered]@{ type = 'user'; uuid = 's1'; parentUuid = $null; isSidechain = $true; agentId = 'aaa111'; sessionId = $claudeId; cwd = 'C:\Work\ClaudeRepo'; timestamp = '2026-08-13T05:01:00Z'; message = [ordered]@{ role = 'user'; content = 'Sub task prompt' } },
        [ordered]@{ type = 'user'; uuid = 's2'; parentUuid = 's1'; isSidechain = $true; isMeta = $true; agentId = 'aaa111'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = 'sub meta secret' } },
        [ordered]@{ type = 'assistant'; uuid = 's3'; parentUuid = 's2'; isSidechain = $true; agentId = 'aaa111'; sessionId = $claudeId; message = [ordered]@{ id = 'm1'; role = 'assistant'; content = @([ordered]@{ type = 'thinking'; thinking = 'sub thinking secret' }, [ordered]@{ type = 'tool_use'; id = 'toolu_nested'; name = 'Agent'; input = [ordered]@{ prompt = 'sub tool secret' } }) } },
        [ordered]@{ type = 'user'; uuid = 's4'; parentUuid = 's3'; isSidechain = $true; agentId = 'aaa111'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = @([ordered]@{ type = 'tool_result'; content = 'sub result secret' }) } },
        [ordered]@{ type = 'assistant'; uuid = 's5'; parentUuid = 's4'; isSidechain = $true; agentId = 'aaa111'; sessionId = $claudeId; message = [ordered]@{ id = 'm2'; role = 'assistant'; content = @([ordered]@{ type = 'tool_use'; id = 'toolu_back'; name = 'SubagentHandback'; input = [ordered]@{ message = 'Sub final report' } }) } }
    )
    [IO.File]::WriteAllText((Join-Path $claudeAgentDir 'agent-aaa111.meta.json'), '{"agentType":"Explore","description":"Look around","toolUseId":"toolu_root","model":"claude-haiku-5-5","finished":true}', (New-Object Text.UTF8Encoding($false)))
    Write-JsonLines (Join-Path $claudeAgentDir 'agent-bbb222.jsonl') @(
        [ordered]@{ type = 'user'; uuid = 'n1'; parentUuid = $null; isSidechain = $true; agentId = 'bbb222'; sessionId = $claudeId; message = [ordered]@{ role = 'user'; content = 'Nested prompt' } },
        [ordered]@{ type = 'assistant'; uuid = 'n2'; parentUuid = 'n1'; isSidechain = $true; agentId = 'bbb222'; sessionId = $claudeId; message = [ordered]@{ id = 'm3'; role = 'assistant'; content = @([ordered]@{ type = 'text'; text = 'Nested answer' }) } }
    )
    [IO.File]::WriteAllText((Join-Path $claudeAgentDir 'agent-bbb222.meta.json'), '{"agentType":"general-purpose","description":"Nested job","toolUseId":"toolu_nested","finished":false}', (New-Object Text.UTF8Encoding($false)))
    $bundleResult = @(& $exporter -Harness Claude -SessionPath $claudePath -ConfigPath $configPath)
    $bundleExport = ($bundleResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $bundleDir = Split-Path -Parent $bundleExport
    Assert-True ($bundleExport -like '*\Claude-ClaudeRepo\Claude_Claude-Test_*\conversation.md' -and -not (Test-Path -LiteralPath $claudeExport)) 'Claude subagents did not migrate the flat export into a bundle'
    Assert-True ([bool](@($bundleResult) -match 'completeness=partial')) 'Claude unfinished subagent not reported as partial'
    $subText = Get-Content -LiteralPath (Join-Path $bundleDir 'subagents\aaa111.md') -Raw -Encoding UTF8
    Assert-True ($subText -match 'Sub task prompt' -and $subText -match 'Sub final report' -and $subText -match 'Explore') 'Claude subagent prompt, handback report or type missing'
    Assert-True ($subText -notmatch 'secret') 'Claude subagent internal content leaked'
    $bundleManifest = Get-Content -LiteralPath (Join-Path $bundleDir 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $nestedEntry = @($bundleManifest.subagents | Where-Object id -eq 'bbb222')
    Assert-True ($nestedEntry.Count -eq 1 -and $nestedEntry[0].parentId -eq 'aaa111' -and $nestedEntry[0].status -eq 'partial') 'Claude nested subagent parent or status wrong'
    Assert-True ((Get-Content -LiteralPath $bundleExport -Raw -Encoding UTF8) -match 'Claude final') 'Claude bundle lost the main transcript'
    $bundleAgain = @(& $exporter -Harness Claude -SessionPath $claudePath -ConfigPath $configPath)
    Assert-True ([bool](@($bundleAgain) -match [regex]::Escape("EXPORTED|$bundleExport|"))) 'Claude bundle re-export changed path'

    $agyHome = Join-Path $testRoot 'antigravity'
    $agyParent = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    $agyChild = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    $agyGrandchild = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
    $agyMissing = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    $agyGenerator = Join-Path $testRoot 'make-antigravity-fixture.py'
    @'
from contextlib import closing
from pathlib import Path
import sqlite3
import sys

def varint(value):
    result = bytearray()
    while value >= 128:
        result.append((value & 127) | 128)
        value >>= 7
    return bytes(result + bytes([value]))

def field(number, value):
    if isinstance(value, int):
        return varint(number << 3) + varint(value)
    if isinstance(value, str):
        value = value.encode("utf-8")
    return varint(number << 3 | 2) + varint(len(value)) + value

def step(kind, number, body):
    return kind, field(1, kind) + field(number, body)

def answer(text):
    return step(15, 20, field(8, text) + field(3, "secret reasoning"))

def invoke(child):
    return step(132, 132, f'invoke_subagent {{"conversationId":  "{child}"}}')

def message(sender, recipient, text, source_idx):
    origin = field(12, field(1, field(2, source_idx)))
    envelope = field(2, recipient) + field(3, sender) + field(4, text) + origin
    return step(101, 114, field(3, "agent_message") + field(4, envelope))

def insert_steps(db, steps, start=0):
    db.executemany("INSERT INTO steps VALUES (?, ?, ?, 0)",
                   ((idx, kind, payload) for idx, (kind, payload) in enumerate(steps, start)))

def create(session, steps, parent=None, role=None):
    with closing(sqlite3.connect(directory / f"{session}.db")) as db, db:
        db.executescript("""
            CREATE TABLE trajectory_meta (trajectory_id TEXT, cascade_id TEXT);
            CREATE TABLE steps (idx INTEGER PRIMARY KEY, step_type INTEGER,
                                step_payload BLOB, step_format INTEGER);
            CREATE TABLE parent_references (idx INTEGER, data BLOB);
            CREATE TABLE trajectory_metadata_blob (id TEXT, data BLOB);
        """)
        db.execute("INSERT INTO trajectory_meta VALUES (?, ?)", (session, session))
        metadata = field(2, field(1, 1793232000)) + field(7, "file:///c%3A/Work/AgyRepo")
        if parent:
            metadata += field(5, parent) + field(8, field(1, "self") + field(2, role) + field(3, "secret spawn config"))
        db.execute("INSERT INTO trajectory_metadata_blob VALUES ('main', ?)", (metadata,))
        insert_steps(db, steps)

home, parent, child, grandchild, missing, phase = sys.argv[1:]
directory = Path(home) / "conversations"
parent_db = directory / f"{parent}.db"
if phase == "flat":
    directory.mkdir(parents=True)
    create(parent, [
        step(14, 19, field(2, "Antigravity visible prompt")),
        answer("Antigravity visible reply"),
        step(101, 114, field(3, "secret system message")),
        step(132, 132, "secret tool output"),
    ])
elif phase == "complete":
    create(child, [
        message(parent, child, "Child task", 4),
        answer("Child answer"),
        invoke(grandchild),
        message(grandchild, child, "Nested report", 1),
        answer("Child continuation"),
    ], parent, "Researcher")
    create(grandchild, [
        message(child, grandchild, "Nested task", 2),
        answer("Nested answer"),
    ], child, "Verifier")
    with closing(sqlite3.connect(parent_db)) as db, db:
        insert_steps(db, [invoke(child), message(child, parent, "Child report", 1)], start=4)
elif phase == "partial":
    with closing(sqlite3.connect(parent_db)) as db, db:
        db.execute("DELETE FROM steps WHERE idx=5")
        insert_steps(db, [invoke(missing)], start=5)
'@ | Set-Content -LiteralPath $agyGenerator -Encoding ASCII
    $agyPython = Get-Command python, python3, py -ErrorAction SilentlyContinue | Select-Object -First 1
    $agyPythonArgs = @()
    if ($agyPython.Name -in @('py', 'py.exe')) { $agyPythonArgs += '-3' }
    $agyPythonArgs += @($agyGenerator, $agyHome, $agyParent, $agyChild, $agyGrandchild, $agyMissing)
    $agyExportArgs = @{ Harness = 'Antigravity'; AntigravityHome = $agyHome; ConfigPath = $configPath }

    & $agyPython.Source @agyPythonArgs flat
    Assert-True ($LASTEXITCODE -eq 0) 'Antigravity flat fixture generation failed'
    $agyFlatResult = @(& $exporter @agyExportArgs -SessionId $agyParent)
    $agyFlatPath = ($agyFlatResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $agyProject = Split-Path -Parent $agyFlatPath
    Assert-True ($agyFlatPath -like '*.md' -and (Split-Path -Leaf $agyFlatPath) -ne 'conversation.md' -and
        @(Get-ChildItem -LiteralPath $agyProject -Recurse -File).Count -eq 1) 'Antigravity session without subagents did not produce one flat Markdown file'
    $agyFlatText = Get-Content -LiteralPath $agyFlatPath -Raw -Encoding UTF8
    Assert-True ($agyFlatText -match '# User 1\s+Antigravity visible prompt' -and
        $agyFlatText -match '# Model 1\s+Antigravity visible reply') 'Antigravity flat transcript lost visible user or assistant text'
    Assert-True ($agyFlatText -notmatch 'secret') 'Antigravity flat transcript leaked private text'

    & $agyPython.Source @agyPythonArgs complete
    Assert-True ($LASTEXITCODE -eq 0) 'Antigravity complete fixture generation failed'
    $agyListed = @(& $exporter @agyExportArgs -List | Select-Object -ExpandProperty SessionId)
    Assert-True ($agyListed -contains $agyParent -and $agyListed -notcontains $agyChild) 'Antigravity list did not hide the child while its parent existed'
    $agyBundleResult = @(& $exporter @agyExportArgs -SessionId $agyParent)
    $agyConversation = ($agyBundleResult | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    $agyBundle = Join-Path $agyProject ([IO.Path]::GetFileNameWithoutExtension($agyFlatPath))
    Assert-True ($agyConversation -eq (Join-Path $agyBundle 'conversation.md') -and
        -not (Test-Path -LiteralPath $agyFlatPath)) 'Antigravity did not migrate the flat export to a bundle and remove the old file'
    $agyMain = Get-Content -LiteralPath $agyConversation -Raw -Encoding UTF8
    Assert-True ($agyMain.Contains('Antigravity visible prompt') -and $agyMain.Contains('Antigravity visible reply') -and
        $agyMain -notmatch 'Child (task|report)|Nested (task|report)') 'Antigravity bundle lost root text or mixed subagent turns into it'
    $agyChildText = Get-Content -LiteralPath (Join-Path $agyBundle "subagents/$agyChild.md") -Raw -Encoding UTF8
    Assert-True ($agyChildText -match '# User 1\s+Child task\s+# Model 1\s+Child answer\s+# Model 2\s+Child report\s+# Model 3\s+Child continuation') 'Antigravity child roles or report placement at the sender step are wrong'
    $agyManifestPath = Join-Path $agyBundle 'manifest.json'
    $agyManifest = Get-Content -LiteralPath $agyManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $agyChildEntry = @($agyManifest.subagents | Where-Object id -eq $agyChild)
    Assert-True ($agyManifest.status -eq 'complete' -and $agyChildEntry.Count -eq 1 -and
        $agyChildEntry[0].parentId -eq $agyParent -and $agyChildEntry[0].type -eq 'self' -and
        $agyChildEntry[0].name -eq 'Researcher' -and $agyChildEntry[0].status -eq 'complete') 'Antigravity complete manifest has incorrect child identity, role or status'
    $agyNested = @($agyManifest.subagents | Where-Object id -eq $agyGrandchild)
    Assert-True ($agyNested.Count -eq 1 -and $agyNested[0].parentId -eq $agyChild) 'Antigravity nested manifest entry did not retain its immediate parent'
    Assert-True (-not (Get-ChildItem -LiteralPath $agyBundle -Recurse -File | Select-String -SimpleMatch 'secret')) 'Antigravity complete bundle leaked private text'

    & $agyPython.Source @agyPythonArgs partial
    Assert-True ($LASTEXITCODE -eq 0) 'Antigravity partial fixture generation failed'
    $agyPartialResult = @(& $exporter @agyExportArgs -SessionId $agyParent)
    Assert-True ([bool]($agyPartialResult -match '^EXPORTED\|.*\|completeness=partial$')) 'Antigravity missing source interrupted export or did not report partial'
    $agyPartial = Get-Content -LiteralPath $agyManifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $agyPending = @($agyPartial.subagents | Where-Object id -eq $agyChild)
    Assert-True ($agyPartial.status -eq 'partial' -and $agyPending.Count -eq 1 -and
        $agyPending[0].status -eq 'partial' -and $agyPending[0].warnings -contains 'Subagent has not reported back.') 'Antigravity child without a report was not marked partial'
    $agyUnavailable = @($agyPartial.subagents | Where-Object id -eq $agyMissing)
    Assert-True ($agyUnavailable.Count -eq 1 -and $agyUnavailable[0].status -eq 'partial' -and
        -not $agyUnavailable[0].path -and $agyUnavailable[0].warnings -contains 'Subagent source could not be read.') 'Antigravity missing child was not recorded as partial with no attachment'
    Assert-True (-not (Get-ChildItem -LiteralPath $agyBundle -Recurse -File | Select-String -SimpleMatch 'secret')) 'Antigravity partial bundle leaked private text'

    Move-Item -LiteralPath (Join-Path $agyHome "conversations/$agyParent.db") -Destination $testRoot
    $agyOrphanList = @(& $exporter @agyExportArgs -List | Select-Object -ExpandProperty SessionId)
    Assert-True ($agyOrphanList -contains $agyChild) 'Antigravity list did not show the child after its parent was moved'

    $agyBroken = Join-Path $agyHome 'conversations/99999999-9999-4999-8999-999999999999.db'
    [IO.File]::WriteAllBytes($agyBroken, [byte[]](1..64))
    $agyListWarnings = $null
    $agyBrokenList = @(& $exporter @agyExportArgs -List -WarningVariable agyListWarnings -WarningAction SilentlyContinue 2>$null | Select-Object -ExpandProperty SessionId)
    Assert-True ($agyBrokenList -contains $agyChild -and @($agyListWarnings | Where-Object { "$_" -like '*99999999-9999*' }).Count -eq 1) 'Antigravity list stopped at an unreadable conversation or did not warn about it'
    $agyNamed = $false
    try { & $exporter @agyExportArgs -SessionPath $agyBroken 2>$null | Out-Null } catch { $agyNamed = $true }
    Assert-True $agyNamed 'Antigravity export of a named unreadable conversation did not fail'
    Remove-Item -LiteralPath $agyBroken

    $customConfig = Join-Path $testRoot 'custom-config.json'
    & $exporter -Configure -ConfigPath $customConfig -OutputRoot (Join-Path $testRoot 'custom-output') `
        -CodexFolderPrefix '' -CodexFilePrefix '' -GrokFolderPrefix '' -GrokFilePrefix '' `
        -CommandCodeFolderPrefix '' -CommandCodeFilePrefix '' | Out-Null
    $custom = Get-Content -LiteralPath $customConfig -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True ([string]$custom.harnesses.Hermes.folderPrefix -eq 'Hermes-' -and [string]$custom.harnesses.Hermes.filePrefix -eq 'Hermes_') 'Hermes naming profile missing'
    Assert-True ([string]$custom.harnesses.Omp.folderPrefix -eq 'Omp-' -and [string]$custom.harnesses.Omp.filePrefix -eq 'OMP_') 'OMP naming profile missing'
    Assert-True ([string]$custom.harnesses.Claude.folderPrefix -eq 'Claude-' -and [string]$custom.harnesses.Claude.filePrefix -eq 'Claude_') 'Claude naming profile missing'

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

    $mergeConfig = Join-Path $testRoot 'merge-config.json'
    & $exporter -Configure -ConfigPath $mergeConfig -OutputRoot $outputRoot -HermesFolderPrefix 'Keep-' -HermesFilePrefix 'Keep_' | Out-Null
    & $exporter -Configure -ConfigPath $mergeConfig -OutputRoot (Join-Path $testRoot 'merge-out') | Out-Null
    $merged = Get-Content -LiteralPath $mergeConfig -Raw -Encoding UTF8 | ConvertFrom-Json
    Assert-True ([string]$merged.harnesses.Hermes.folderPrefix -eq 'Keep-') 'configure reset an omitted Hermes prefix'
    Assert-True ([string]$merged.outputRoot -like '*merge-out*') 'configure did not update the output root'

    $movedDir = Join-Path $outputRoot 'moved'
    [IO.Directory]::CreateDirectory($movedDir) | Out-Null
    $movedFile = Join-Path $movedDir 'kept.md'
    Move-Item -LiteralPath $codexExport -Destination $movedFile
    $again = @(& $exporter -Harness Codex -SessionPath $codexPath -ConfigPath $configPath)
    $againPath = ($again | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($againPath -eq $movedFile) 're-export did not update the file outside the project folder'
    $movedRename = @(& $exporter -Harness Codex -SessionPath $codexPath -ConfigPath $configPath -Title 'Moved Rename')
    $movedRenamePath = ($movedRename | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ((Split-Path -Parent $movedRenamePath) -eq $movedDir -and -not (Test-Path -LiteralPath $movedFile)) 'title rename moved the archive out of its folder'

    $importantDir = Join-Path $outputRoot '_important'
    $starred = @(& $exporter -Harness Codex -SessionPath $codexPath -ConfigPath $configPath -Important)
    $starredPath = ($starred | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ($starredPath -eq (Join-Path $importantDir (Split-Path -Leaf $movedRenamePath)) -and -not (Test-Path -LiteralPath $movedRenamePath)) '-Important did not move the archive flat into _important'
    $userDir = Join-Path $importantDir 'core'
    [IO.Directory]::CreateDirectory($userDir) | Out-Null
    $userFile = Join-Path $userDir 'kept.md'
    Move-Item -LiteralPath $starredPath -Destination $userFile
    $kept = @(& $exporter -Harness Codex -SessionPath $codexPath -ConfigPath $configPath -Important -Title 'Still Important')
    $keptPath = ($kept | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ((Split-Path -Parent $keptPath) -eq $userDir) '-Important moved an archive out of a user folder under _important'

    $ompStarred = @(& $exporter -Harness Omp -SessionPath $ompPath -ConfigPath $configPath -Important)
    $ompStarredPath = ($ompStarred | Where-Object { $_ -like 'EXPORTED|*' }) -replace '^EXPORTED\|([^|]+)\|.*$', '$1'
    Assert-True ((Split-Path -Parent (Split-Path -Parent $ompStarredPath)) -eq $importantDir -and (Split-Path -Leaf (Split-Path -Parent $ompStarredPath)) -like 'OMP_Renamed-OMP_*') '-Important did not move the OMP bundle into _important'
    Assert-True ((Get-ChildItem -LiteralPath (Split-Path -Parent $ompStarredPath) -Recurse -File -Filter '*.md').Count -ge 2) '-Important lost OMP attachments'
    Assert-True (-not (Get-ChildItem -LiteralPath $outputRoot -Recurse -Force -Filter '.*.tmp')) 'atomic write left a temp file'


    "SELF_TEST_OK checks=$script:checks"
} finally {
    if ((Test-Path -LiteralPath $resolvedTest) -and $resolvedTest.StartsWith($resolvedTemp, [StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedTest -Recurse -Force
    }
}
