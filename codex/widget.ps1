#requires -Version 5.1
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -Path (Join-Path $PSScriptRoot "desktop-window.cs")
Add-Type -Path (Join-Path $PSScriptRoot "widget-window.cs") -ReferencedAssemblies "System.Windows.Forms.dll", "System.Drawing.dll"

$bundlePath = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\dist\codex-hud.js"))
if (-not (Test-Path -LiteralPath $bundlePath -PathType Leaf)) {
  throw "Codex HUD bundle not found. Run npm run build from the repository root."
}

$currentDirectory = [System.IO.Path]::GetFullPath((Get-Location).Path).TrimEnd([char[]]@("\", "/"))
function Find-PathExecutable {
  param([string[]]$Names)
  foreach ($pathEntry in ($env:PATH -split ";")) {
    $directory = $pathEntry.Trim().Trim('"')
    if ($directory -eq "" -or -not [System.IO.Path]::IsPathRooted($directory)) { continue }
    try {
      $fullDirectory = [System.IO.Path]::GetFullPath($directory).TrimEnd([char[]]@("\", "/"))
      if ($fullDirectory -ieq $currentDirectory) { continue }
      foreach ($name in $Names) {
        $candidate = Join-Path $fullDirectory $name
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate }
      }
    } catch {
      continue
    }
  }
}
$nodePath = Find-PathExecutable @("node.exe")
if (-not $nodePath) {
  throw "Node.js was not found on PATH. Install Node.js 18 or newer."
}

try {
  $selfPathPattern = [regex]::Escape($PSCommandPath)
  $olderWidgets = Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" -ErrorAction SilentlyContinue |
    Where-Object {
      $_.ProcessId -ne $PID -and
      $_.CommandLine -and
      ($_.CommandLine -match $selfPathPattern -or $_.CommandLine -match 'codex[\\/]+widget\.ps1')
    }
  foreach ($proc in $olderWidgets) {
    try {
      Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
      Wait-Process -Id $proc.ProcessId -Timeout 2 -ErrorAction SilentlyContinue
    } catch {
      # Older instance may have exited concurrently.
    }
  }
} catch {
  # Process enumeration is best-effort.
}

$script:suppressLayoutSave = $true
$form = [CodexWidgetForm]::new()
$localData = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
$layoutPath = if ($localData) { Join-Path $localData "CodexQuotaWidget\layout.txt" } else { "" }
$form.RestoreLayout($layoutPath)
$updated = $form.Recorded

$script:desktopPinned = $false
function Save-WidgetLayout {
  if ($script:suppressLayoutSave) { return }
  if ($form.Visible -and $form.WindowState -eq [System.Windows.Forms.FormWindowState]::Normal) {
    $form.SaveLayout($layoutPath, $script:desktopPinned)
  }
}

function Pin-Widget {
  if ($script:desktopPinned) { return }
  $wasVisible = $form.Visible
  $location = if ($wasVisible) { $form.PointToScreen([System.Drawing.Point]::Empty) } else { $form.Location }
  $desktopHost = [CodexDesktopWindow]::FindHost()
  if ($desktopHost -eq [IntPtr]::Zero) {
    if ($wasVisible) { $form.SaveLayout($layoutPath, $script:desktopPinned) }
    return
  }

  $prevSuppress = $script:suppressLayoutSave
  $script:suppressLayoutSave = $true
  try {
    $form.Hide()
    $form.SetDesktopFrame($true)
    $form.Location = $location
    $script:desktopPinned = [CodexDesktopWindow]::Attach($form.Handle, $desktopHost, $location.X, $location.Y)
    if ($script:desktopPinned) {
      $editItem.Text = "Move or resize"
      if ($wasVisible) { $form.Show() }
    } else {
      $form.SetDesktopFrame($false)
      if ($wasVisible) {
        $form.Show()
        $offset = $form.GetClientScreenOffset()
        $form.Location = [System.Drawing.Point]::new($location.X - $offset.Width, $location.Y - $offset.Height)
      } else {
        $form.Location = $location
      }
    }
  } finally {
    $script:suppressLayoutSave = $prevSuppress
  }
  if ($wasVisible) { $form.SaveLayout($layoutPath, $script:desktopPinned) }
}

function Edit-Widget {
  $prevSuppress = $script:suppressLayoutSave
  $script:suppressLayoutSave = $true
  try {
    if ($script:desktopPinned) {
      $clientScreen = $form.PointToScreen([System.Drawing.Point]::Empty)
      $form.Hide()
      if ([CodexDesktopWindow]::Detach($form.Handle)) {
        $script:desktopPinned = $false
        $form.SetDesktopFrame($false)
        $editItem.Text = "Pin to desktop"
        $form.Show()
        $offset = $form.GetClientScreenOffset()
        $form.Location = [System.Drawing.Point]::new($clientScreen.X - $offset.Width, $clientScreen.Y - $offset.Height)
      } else {
        $form.Show()
      }
    } else {
      $form.Show()
    }
  } finally {
    $script:suppressLayoutSave = $prevSuppress
  }
  if (-not $script:desktopPinned) {
    $form.Activate()
    $form.SaveLayout($layoutPath, $script:desktopPinned)
  }
}

$trayMenu = [CodexWidgetForm]::CreateTrayMenu()
$editItem = $trayMenu.Items.Add("Pin to desktop")
$editItem.Add_Click({
  if ($script:desktopPinned) { Edit-Widget }
  else {
    Pin-Widget
    if ($script:desktopPinned) { $form.Show() }
  }
})
$visibilityItem = $trayMenu.Items.Add("Hide")
$visibilityItem.Add_Click({
  if ($form.Visible) { $form.Hide() }
  else { $form.Show() }
})
$trayMenu.Add_Opening({
  if ($form.Visible) { $visibilityItem.Text = "Hide" }
  else { $visibilityItem.Text = "Show" }
})
$exitItem = $trayMenu.Items.Add("Exit")
$exitItem.Add_Click({ $form.Close() })

$customIcon = [CodexWidgetForm]::CreateTrayIcon()
$form.Icon = $customIcon

$trayIcon = New-Object System.Windows.Forms.NotifyIcon
$trayIcon.Text = "Codex quota"
$trayIcon.Icon = $customIcon
$trayIcon.ContextMenuStrip = $trayMenu
$trayIcon.Add_DoubleClick({ Edit-Widget })
$trayIcon.Visible = $true

$startInfo = New-Object System.Diagnostics.ProcessStartInfo
$startInfo.FileName = $nodePath
$startInfo.Arguments = '"' + $bundlePath + '" --json'
$startInfo.UseShellExecute = $false
$startInfo.RedirectStandardOutput = $true
$startInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8
$startInfo.CreateNoWindow = $true

$script:quotaProcess = $null
function Stop-QuotaRead {
  if ($null -eq $script:quotaProcess) { return }
  try {
    if (-not $script:quotaProcess.HasExited) { $script:quotaProcess.Kill() }
  } catch {
    # The reader may exit between HasExited and Kill.
  } finally {
    $script:quotaProcess.Dispose()
    $script:quotaProcess = $null
  }
}

$unavailable = "Codex quota unavailable. Check Codex login."
$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 250
$timer.Add_Tick({
  try {
    if ($null -eq $script:quotaProcess) {
      $script:quotaProcess = [System.Diagnostics.Process]::Start($startInfo)
      $script:quotaOutput = $script:quotaProcess.StandardOutput.ReadToEndAsync()
      $script:quotaDeadline = [DateTime]::UtcNow.AddSeconds(10)
      $timer.Interval = 250
      return
    }

    if (-not ($script:quotaProcess.HasExited -and $script:quotaOutput.IsCompleted)) {
      if ([DateTime]::UtcNow -lt $script:quotaDeadline) { return }
      throw "Codex quota read timed out."
    }

    $raw = $script:quotaOutput.GetAwaiter().GetResult()
    if ($raw.Length -gt 32768) { throw "Codex HUD response was too large." }
    $snapshot = ConvertFrom-Json -InputObject $raw
    $windows = @(foreach ($window in $snapshot.windows) {
      if ($window.text -and $null -ne $window.remainingPercent) {
        [CodexQuotaWindow]::new(
          [string]$window.text,
          [int]$window.remainingPercent,
          [string]$window.label,
          [string]$window.resetCountdown,
          [string]$window.resetAbsolute,
          [string]$window.resetText
        )
      }
    })
    $form.SetQuota(($snapshot.text -replace "^Codex quota\r?\n", ""), $windows)
    $updated.Text = "No recorded quota"
    if ($null -ne $snapshot.recordedAtMs) {
      $recorded = [DateTimeOffset]::FromUnixTimeMilliseconds($snapshot.recordedAtMs)
      $updated.Text = "Updated: " + $recorded.ToLocalTime().ToString("dd-MMM-yyyy h:mm tt", [System.Globalization.CultureInfo]::InvariantCulture)
    }
  } catch {
    $form.SetQuota($unavailable, $null)
    $updated.Text = "No recorded quota"
  }
  Stop-QuotaRead
  $timer.Interval = 60000
})
$form.Add_Shown({
  $script:suppressLayoutSave = $false
  $timer.Start()
})
$form.Add_LocationChanged({ Save-WidgetLayout })
$form.Add_SizeChanged({ Save-WidgetLayout })
$form.Add_ResizeEnd({ Save-WidgetLayout })
$form.Add_FormClosing({
  $script:suppressLayoutSave = $false
  if ($form.WindowState -eq [System.Windows.Forms.FormWindowState]::Normal) {
    $form.SaveLayout($layoutPath, $script:desktopPinned)
  }
})
$form.Add_FormClosed({
  $timer.Stop()
  $timer.Dispose()
  $trayIcon.Visible = $false
  $trayIcon.Dispose()
  $trayMenu.Dispose()
  $customIcon.Dispose()
  Stop-QuotaRead
})

Pin-Widget
[System.Windows.Forms.Application]::Run($form)
