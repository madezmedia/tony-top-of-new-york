' RokuAds.brs - TONY app wrapper for Roku Advertising Framework
' This file WRAPS the built-in RAF library defined in the manifest
Library "Roku_Ads.brs"

sub init()
  m.top.functionName = "executePreroll"
end sub

' This runs on the background Task thread
sub executePreroll()
  ' If premium, skip immediately
  if m.top.isPremium then
    m.top.adPlaying = false
    m.top.adCompleted = true
    return
  end if

  adUrl = m.top.adUrl
  if adUrl = "" or adUrl = "invalid" then
    publisherId = "YOUR_PUBLISHER_ID"
    appId = "dev.tony.series" 
    adUrl = "https://rox.roku.com/ifa/v1/ad/" + publisherId + "/" + appId
  end if
  
  ' Create RAF instance securely in the background thread
  m.raf = Roku_Ads()
  m.raf.setAdUrl(adUrl)
  
  m.top.adPlaying = true
  m.top.adCompleted = false
  
  ' Retrieve ads, then show them manually
  adPods = m.raf.getAds()
  if adPods <> invalid and adPods.count() > 0 then
    m.raf.showAds(adPods)
  end if
  
  m.top.adPlaying = false
  m.top.adCompleted = true
end sub
