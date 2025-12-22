# API Endpoint Testing Script for EarthTogether
$baseUrl = "https://earthtogether.onrender.com"
$results = @()

Write-Host "=== Testing EarthTogether API Endpoints ===" -ForegroundColor Cyan
Write-Host ""

# Helper function to test endpoint
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [hashtable]$Body = $null,
        [string]$Token = $null,
        [bool]$ExpectAuth = $false
    )
    
    $url = "$baseUrl$Endpoint"
    $headers = @{"Content-Type" = "application/json"}
    
    if ($Token) {
        $headers["x-auth-token"] = $Token
    }
    
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $status = "✓ PASS"
        $statusCode = $response.StatusCode
        $color = "Green"
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        if ($ExpectAuth -and $statusCode -eq 401) {
            $status = "✓ PASS (Auth Required)"
            $color = "Yellow"
        }
        else {
            $status = "✗ FAIL"
            $color = "Red"
        }
    }
    
    Write-Host "$status [$statusCode] $Method $Endpoint - $Description" -ForegroundColor $color
    
    return @{
        Endpoint = $Endpoint
        Method = $Method
        Status = $status
        StatusCode = $statusCode
        Description = $Description
    }
}

# 1. Test Public Endpoints
Write-Host "`n--- PUBLIC ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/health" -Description "Health Check"
$results += Test-Endpoint -Method "GET" -Endpoint "/api/admin/test" -Description "Admin Test"
$results += Test-Endpoint -Method "GET" -Endpoint "/api/admin/users-public" -Description "Public Users List"

# 2. Test Authentication Endpoints
Write-Host "`n--- AUTHENTICATION ENDPOINTS ---" -ForegroundColor Yellow

# Register new user
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    username = "testuser_$timestamp"
    email = "testuser_$timestamp@test.com"
    password = "test123456"
}

try {
    $registerResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Body ($registerBody | ConvertTo-Json) -ContentType "application/json" -UseBasicParsing
    $registerData = $registerResponse.Content | ConvertFrom-Json
    $token = $registerData.token
    Write-Host "✓ PASS [201] POST /api/auth/register - Register User" -ForegroundColor Green
    $results += @{Endpoint="/api/auth/register"; Method="POST"; Status="✓ PASS"; StatusCode=201; Description="Register User"}
}
catch {
    Write-Host "✗ FAIL POST /api/auth/register - Register User" -ForegroundColor Red
    $results += @{Endpoint="/api/auth/register"; Method="POST"; Status="✗ FAIL"; StatusCode=500; Description="Register User"}
    $token = $null
}

# Login
if ($token) {
    $loginBody = @{
        email = $registerBody.email
        password = $registerBody.password
    }
    $results += Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Description "Login User" -Body $loginBody
    
    # Get authenticated user
    $results += Test-Endpoint -Method "GET" -Endpoint "/api/auth/user" -Description "Get Auth User" -Token $token
}

# 3. Test Protected Endpoints (require auth)
Write-Host "`n--- USER ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/users/search?q=test" -Description "Search Users" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/users/leaderboard" -Description "Get Leaderboard" -Token $token -ExpectAuth $true

Write-Host "`n--- HABITS ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/habits" -Description "Get Habits" -Token $token -ExpectAuth $true

Write-Host "`n--- POSTS ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/posts" -Description "Get All Posts" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/posts/my-posts" -Description "Get My Posts" -Token $token -ExpectAuth $true

Write-Host "`n--- NEWS ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/news" -Description "Get News Articles" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/news/gemini" -Description "Get Gemini News" -ExpectAuth $false

Write-Host "`n--- CHALLENGES ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/challenges" -Description "Get Challenges" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/challenges/joined" -Description "Get Joined Challenges" -Token $token -ExpectAuth $true

Write-Host "`n--- MEMES ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/memes" -Description "Get Memes" -Token $token -ExpectAuth $true

Write-Host "`n--- QUIZZES ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/quizzes" -Description "Get Quizzes" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/quizzes/flashcards" -Description "Get Flashcards" -Token $token -ExpectAuth $true

Write-Host "`n--- RESEARCH ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/research" -Description "Get Research Articles" -Token $token -ExpectAuth $true

Write-Host "`n--- ADMIN ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/admin" -Description "Admin Panel" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/admin/users" -Description "Get All Users" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/admin/database-stats" -Description "Database Stats" -Token $token -ExpectAuth $true
$results += Test-Endpoint -Method "GET" -Endpoint "/api/admin/stats" -Description "Admin Stats" -Token $token -ExpectAuth $true

Write-Host "`n--- NOTIFICATIONS ENDPOINTS ---" -ForegroundColor Yellow
$results += Test-Endpoint -Method "GET" -Endpoint "/api/notifications" -Description "Get Notifications" -Token $token -ExpectAuth $true

# Summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
$totalTests = $results.Count
$passedTests = ($results | Where-Object { $_.Status -like "*PASS*" }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests/$totalTests)*100, 2))%" -ForegroundColor Cyan

# Export results to JSON
$results | ConvertTo-Json | Out-File "endpoint-test-results.json"
Write-Host "`nResults saved to endpoint-test-results.json" -ForegroundColor Green
