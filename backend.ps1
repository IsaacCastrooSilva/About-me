param(
    [ValidateSet('iniciar', 'compilar', 'testar', 'empacotar')]
    [string]$Acao = 'iniciar'
)

$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if ($Acao -eq 'iniciar') {
        $backendPort = if ($env:SERVER_PORT) { [int]$env:SERVER_PORT } else { 8080 }
        $backendConnection = New-Object System.Net.Sockets.TcpClient
        try {
            $backendConnection.Connect('localhost', $backendPort)
            $backendPortOccupied = $true
        } catch [System.Net.Sockets.SocketException] {
            $backendPortOccupied = $false
        } finally {
            $backendConnection.Dispose()
        }
        if ($backendPortOccupied) {
            throw "A porta $backendPort ja esta em uso. Se o backend estiver aberto em outro terminal, pare com Ctrl+C antes de iniciar novamente. Se foi iniciado pelo VS Code, use Shift+F5."
        }

        $backendDatabase = Join-Path $PSScriptRoot 'data/portfolioai.mv.db'
        if (Test-Path -LiteralPath $backendDatabase) {
            try {
                $backendDatabaseCheck = [System.IO.File]::Open($backendDatabase, 'Open', 'ReadWrite', 'None')
                $backendDatabaseCheck.Dispose()
            } catch [System.IO.IOException] {
                throw 'O banco do portfolio esta em uso por outra instancia. Pare o backend anterior antes de iniciar novamente. Nao exclua o banco de dados.'
            }
        }

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
