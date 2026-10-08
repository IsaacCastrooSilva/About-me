param(
    [ValidateSet('iniciar', 'compilar', 'testar', 'empacotar')]
    [string]$Acao = 'iniciar'
)

$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if ($Acao -eq 'iniciar') {
        $envFile = Join-Path $PSScriptRoot '.env'
        if (Test-Path -LiteralPath $envFile) {
            foreach ($line in Get-Content -LiteralPath $envFile -Encoding UTF8) {
                if ($line -match '^\s*(GEMINI_API_KEY|GROQ_API_KEY)\s*=(.*)$') {
                    $key = $Matches[1]
                    $value = $Matches[2].Trim()
                    if ($value.Length -ge 2 -and
                        (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                         ($value.StartsWith("'") -and $value.EndsWith("'")))) {
                        $value = $value.Substring(1, $value.Length - 2)
                    }
                    if (-not [string]::IsNullOrWhiteSpace($value)) {
                        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
                    }
                }
            }
        }
        foreach ($key in @('GEMINI_API_KEY', 'GROQ_API_KEY')) {
            if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($key, 'Process'))) {
                throw "Preencha $key no arquivo $envFile ou defina a variavel no terminal."
            }
        }
    }

    [string[]]$mavenArgs = switch ($Acao) {
        'iniciar' { @('spring-boot:run') }
        'compilar' { @('compile') }
        'testar' { @('-Dtest=ConversationPersistenceServiceTest,ConversationMemoryPersistenceServiceTest', 'test') }
        'empacotar' { @('-DskipTests', 'package') }
    }
    & .\mvnw.cmd @mavenArgs
    $resultCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $resultCode
