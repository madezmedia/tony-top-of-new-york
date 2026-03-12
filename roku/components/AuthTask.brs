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
  ' Use non-www as the base, API will handle redirect if needed.
  return "https://topofnewyork.com/api/device/" + path
end function

sub generateCode()
  ' Send as query param too in case POST is morphed to GET
  url = getApiUrl("code") + "?deviceId=" + m.top.deviceId
  ? "[AuthTask] POST to " ; url
  
  req = CreateObject("roUrlTransfer")
  req.SetUrl(url)
  req.SetCertificatesFile("common:/certs/ca-bundle.crt")
  req.InitClientCertificates()
  req.AddHeader("Content-Type", "application/json")
  req.RetainBodyOnError(true)
  
  body = {
    "deviceId": m.top.deviceId
  }
  
  json = FormatJson(body)
  ? "[AuthTask] Body being sent: " ; json
  
  response = req.PostFromString(json)
  ? "[AuthTask] Response Code: " ; response
  
  if response = 200
    resStr = req.GetToString()
    ? "[AuthTask] Response Body: " ; resStr
    resObj = ParseJson(resStr)
    if resObj <> invalid and resObj.code <> invalid
      m.top.code = resObj.code
      m.top.status = "pending"
    else
      m.top.errorMessage = "Invalid response from server."
      m.top.status = "error"
    end if
  else
    m.top.errorMessage = "Failed to communicate with server (" + str(response).trim() + ")"
    m.top.status = "error"
  end if
end sub

sub pollStatus()
  ' Send as query params too in case POST is morphed to GET
  url = getApiUrl("status") + "?code=" + m.top.code + "&deviceId=" + m.top.deviceId
  ? "[AuthTask] polling " ; url
  
  req = CreateObject("roUrlTransfer")
  req.SetUrl(url)
  req.SetCertificatesFile("common:/certs/ca-bundle.crt")
  req.InitClientCertificates()
  req.AddHeader("Content-Type", "application/json")
  req.RetainBodyOnError(true)
  
  body = {
    "code": m.top.code,
    "deviceId": m.top.deviceId
  }
  
  json = FormatJson(body)
  response = req.PostFromString(json)
  ? "[AuthTask] Poll Response Code: " ; response
  
  else if response = 200
    resStr = req.GetToString()
    resObj = ParseJson(resStr)
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
  else if response = 500
      resStr = req.GetToString()
      resObj = ParseJson(resStr)
      if resObj <> invalid and resObj.instruction <> invalid
        m.top.errorMessage = resObj.instruction
      else
        m.top.errorMessage = "Server configuration error (500)"
      end if
      m.top.status = "error"
  else
      m.top.status = "error"
  end if
end sub
