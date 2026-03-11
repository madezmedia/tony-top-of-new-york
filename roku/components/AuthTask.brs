' AuthTask.brs
' Background task for Device Linking API calls

sub init()
  m.port = CreateObject("roMessagePort")
  m.top.observeField("command", m.port)
  m.top.functionName = "executeCommand"
end sub

sub executeCommand()
  command = m.top.command
  
  if command = "generate"
    generateCode()
  else if command = "poll"
    pollStatus()
  end if
end sub

function getApiUrl(path as string) as string
  return "https://topofnewyork.com/api/device/" + path
end function

sub generateCode()
  req = CreateObject("roUrlTransfer")
  req.SetUrl(getApiUrl("code"))
  req.SetCertificatesFile("common:/certs/ca-bundle.crt")
  req.InitClientCertificates()
  req.AddHeader("Content-Type", "application/json")
  req.RetainBodyOnError(true)
  
  body = {
    deviceId: m.top.deviceId
  }
  
  json = FormatJson(body)
  response = req.PostFromString(json)
  
  if response = 200
    resObj = ParseJson(req.GetString())
    if resObj <> invalid and resObj.code <> invalid
      m.top.code = resObj.code
      m.top.status = "pending"
    else
      m.top.errorMessage = "Invalid response from server."
      m.top.status = "error"
    end if
  else
    m.top.errorMessage = "Failed to communicate with server."
    m.top.status = "error"
  end if
end sub

sub pollStatus()
  req = CreateObject("roUrlTransfer")
  req.SetUrl(getApiUrl("status"))
  req.SetCertificatesFile("common:/certs/ca-bundle.crt")
  req.InitClientCertificates()
  req.AddHeader("Content-Type", "application/json")
  req.RetainBodyOnError(true)
  
  body = {
    code: m.top.code,
    deviceId: m.top.deviceId
  }
  
  json = FormatJson(body)
  response = req.PostFromString(json)
  
  if response = 200
    resObj = ParseJson(req.GetString())
    if resObj <> invalid and resObj.status <> invalid
      m.top.status = resObj.status
      if resObj.status = "linked" and resObj.token <> invalid
        m.top.token = resObj.token
      end if
    else
      m.top.status = "error"
    end if
  else if response = 404
      m.top.status = "invalid"
  else
      m.top.status = "error"
  end if
end sub
