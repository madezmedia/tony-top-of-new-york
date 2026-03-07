sub init()
  m.top.functionName = "fetchFeed"
end sub

sub fetchFeed()
  url = "https://tony-top-of-new-york.vercel.app/api/roku-feed"
  
  request = CreateObject("roUrlTransfer")
  request.setUrl(url)
  request.setCertificatesFile("common:/certs/ca-bundle.crt")
  request.InitClientCertificates()
  
  response = request.GetToString()
  
  if response = ""
    m.top.error = "Network error"
    return
  end if
  
  parsed = ParseJson(response)
  if parsed = invalid or parsed.episodes = invalid
    m.top.error = "Invalid feed data"
    return
  end if
  
  m.top.feedData = parsed
end sub
