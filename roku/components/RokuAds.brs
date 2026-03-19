' RokuAds.brs - TONY app wrapper for Roku Advertising Framework
' This file WRAPS the built-in RAF library defined in the manifest
Library "Roku_Ads.brs"

sub init()
  m.raf = invalid
  m.adPod = invalid
  
  ' Set up observers
  m.top.observeField("adUrl", "onAdUrlChange")
end sub

sub onAdUrlChange()
  url = m.top.adUrl
  if url <> "" and url <> "invalid" then
    initializeRaf(url)
  end if
end sub

sub initializeRaf(adUrl as String)
  ' Create RAF instance (built-in library required in manifest)
  if m.raf = invalid then
    m.raf = Roku_Ads()
    m.raf.setAdUrl(adUrl)
  end if
  
  ' Set up ad content metadata
  adPod = {}
  adPod.addAssociate("renderer", "RAF")
  adPod.addAssociate("adType", "video")
  
  m.adPod = adPod
end sub

' Primary public method to show pre-roll ads before playback starts
sub showPreroll()
  if m.top.isPremium then
    ' Premium users skip ads
    m.top.adPlaying = false
    m.top.adCompleted = true
    return
  end if
  
  if m.raf = invalid then
    ' Determine default ad URL if one wasn't explicitly set
    publisherId = "YOUR_PUBLISHER_ID" ' Should be registered in Roku Dashboard
    appId = "dev.tony.series" 
    adUrl = "https://rox.roku.com/ifa/v1/ad/" + publisherId + "/" + appId
    initializeRaf(adUrl)
  end if
  
  m.top.adPlaying = true
  m.top.adCompleted = false
  
  ' Retrieve ads, then show them
  adPods = m.raf.getAds()
  if adPods <> invalid and adPods.count() > 0 then
    m.raf.showAds(adPods)
  end if
  
  m.top.adPlaying = false
  m.top.adCompleted = true
end sub
