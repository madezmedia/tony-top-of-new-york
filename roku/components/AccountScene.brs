' AccountScene.brs - Controller for linking TV
sub init()
  m.codeLabel = m.top.findNode("codeLabel")
  m.statusLabel = m.top.findNode("statusLabel")
  m.spinner = m.top.findNode("spinner")
  m.authTask = m.top.findNode("authTask")
  m.legalScene = m.top.findNode("legalScene")
  m.legalBtnBg = m.top.findNode("legalBtnBg")

  ' Generate a unique device ID (used for linking security)
  di = CreateObject("roDeviceInfo")
  m.deviceId = di.GetChannelClientId()

  ' Observer for the background task
  m.authTask.observeField("status", "onAuthStatusChanged")

  ' Timer for polling
  m.pollTimer = CreateObject("roSGNode", "Timer")
  m.pollTimer.duration = 5 ' Poll every 5 seconds
  m.pollTimer.repeat = true
  m.pollTimer.observeField("fire", "pollApi")

  ' Start code generation
  generateCode()
end sub

sub generateCode()
  m.spinner.visible = true
  m.codeLabel.text = "GENERATING..."
  m.statusLabel.text = "Contacting server..."
  
  m.authTask.deviceId = m.deviceId
  m.authTask.control = "STOP"
  m.authTask.command = "generate"
  m.authTask.control = "RUN"
end sub

sub pollApi()
  ' Don't poll if we're not pending
  if m.authTask.status <> "pending" then return
  
  m.authTask.command = "poll"
  m.authTask.control = "RUN"
end sub

sub onAuthStatusChanged()
  status = m.authTask.status
  
  if status = "pending"
    m.spinner.visible = false
    m.codeLabel.text = m.authTask.code
    m.statusLabel.text = "Waiting for activation..."
    m.pollTimer.control = "start"
    
  else if status = "linked"
    m.pollTimer.control = "stop"
    m.spinner.visible = false
    m.codeLabel.text = "SUCCESS!"
    m.codeLabel.color = "#4ADE80" ' Green
    m.statusLabel.text = "TV successfully linked."
    
    ' Save the token!
    section = CreateObject("roRegistrySection", "auth")
    section.Write("access_token", m.authTask.token)
    section.Flush()
    
    ' Tell HomeScene we're done
    m.top.authCompleted = true 
    
  else if status = "expired" or status = "invalid"
    m.pollTimer.control = "stop"
    m.spinner.visible = false
    m.codeLabel.text = "EXPIRED"
    m.codeLabel.color = "#FF4444" ' Red
    m.statusLabel.text = "Code expired. Press Back then Accounts to try again."
    
  else if status = "error"
    m.pollTimer.control = "stop"
    m.spinner.visible = false
    m.codeLabel.text = "ERROR"
    m.statusLabel.text = m.authTask.errorMessage
  end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false
  
  if m.legalScene.visible
    return false ' Let LegalScene handle back button
  end if

  if key = "down" and m.legalBtnBg.opacity = 1.0
    m.legalBtnBg.opacity = 0.5
    return true
  end if
  
  if key = "up" and m.legalBtnBg.opacity = 0.5
    m.legalBtnBg.opacity = 1.0
    return true
  end if
  
  if key = "OK" and m.legalBtnBg.opacity = 0.5
    m.legalScene.visible = true
    m.legalScene.setFocus(true)
    return true
  end if

  if key = "back"
    if m.legalBtnBg.opacity = 0.5
      m.legalBtnBg.opacity = 1.0
      return true
    end if
    
    m.pollTimer.control = "stop"
    m.authTask.control = "STOP"
    return false ' Propagate back to HomeScene to hide this component
  end if
  
  return true
end function
