sub init()
  m.top.functionName = "fetchToken"
end sub

sub fetchToken()
  episodeId = m.top.episodeId
  url = "https://tony-top-of-new-york.vercel.app/api/roku-token?episodeId=" + episodeId

  request = CreateObject("roUrlTransfer")
  request.setUrl(url)
  request.setCertificatesFile("common:/certs/ca-bundle.crt")

  response = request.GetToString()

  if response = ""
    m.top.error = "Network error"
    return
  end if

  parsed = ParseJson(response)
  if parsed = invalid or parsed.streamUrl = invalid
    m.top.error = "Episode not available"
    return
  end if

  m.top.tokenData = parsed
end sub
