' RokuAds.brs
' Roku Advertising Framework integration for TONY app

sub init()
  m.adIface = m.top.findNode("adInterface")
  m.adPod = invalid

  ' Set up observers for ad events
  m.top.observeField("adUrl", "onAdUrlChange")
end sub

sub onAdUrlChange()
  url = m.top.adUrl

  if url <> "" then
    loadAd(url)
  end if
end sub

sub loadAd(url as Object)
  ' Create IFA (Roku Ads) interface
  if m.adIface = invalid then
    m.adIface = Roku_Ads()
    m.adIface.setAdUrl(url)
  end if

  ' Set up ad pod
  adPod = createObject("roSGNode", "RokuAdPod")
  adPod.url = url
  adPod.enableTracking = true

  ' Set ad parameters
  adParams = {
    adType: "video"
    contentType: "video"
    contentId: "tony-episode-001"
    publisherId: "tony-series"
    appId: m.global.appInfo.id
    tracking: true
  }

  m.adPod = adPod
  m.top.adLoaded = true

  ' Play the ad
  playAd()
end sub

sub playAd()
  if m.adPod = invalid then return

  m.top.adPlaying = true

  ' Configure ad display
  adConfig = {
    bitrate: 0 ' Auto
    priority: 0
  }

  ' Show ad
  m.adPod.play(adConfig)

  ' Set up ad event observers
  m.adPod.observeField("state", "onAdStateChange")
  m.adPod.observeField("position", "onAdPositionChange")
end sub

sub onAdStateChange()
  state = m.adPod.state

  if state = "finished" then
    m.top.adPlaying = false
    m.top.adCompleted = true
    m.adPod = invalid
  else if state = "error" then
    ? "RokuAds: Ad playback error"
    m.top.adPlaying = false
    m.adPod = invalid
  end if
end sub

sub onAdPositionChange()
  position = m.adPod.position
  ' Track ad position for analytics
  ? "RokuAds: Ad position: "; position
end sub

' Pre-roll ad for content
sub showPreroll(content as Object)
  ' Determine if user is premium
  isPremium = m.global.user.isPremium

  if isPremium then
    ' Premium users: no ads
    return
  end if

  ' Guest users: show ad
  adUrl = getAdUrlForContent(content)
  m.top.adUrl = adUrl
end sub

' Mid-roll ad at position
sub showMidroll(content as Object, position as Integer)
  isPremium = m.global.user.isPremium

  if isPremium then
    return
  end if

  ' Show midroll ad every 10 minutes
  if position MOD 600 = 0 then
    adUrl = getAdUrlForContent(content)
    m.top.adUrl = adUrl
  end if
end sub

function getAdUrlForContent(content as Object) as String
  ' Construct ad URL based on content metadata
  appId = m.global.appInfo.id
  contentId = content.id
  duration = content.duration

  ' Roku IFA ad URL format
  adUrl = "http:// RokuAds.brs"

  ' TODO: Replace with actual IFA ad URL
  ' Format: http://configured.roku.com/ifa/v1/ad/[APP_ID]/[CONTENT_ID]/[DURATION]

  return adUrl
end function

' Post-roll ad
sub showPostroll(content as Object)
  isPremium = m.global.user.isPremium

  if isPremium then
    return
  end if

  adUrl = getAdUrlForContent(content)
  m.top.adUrl = adUrl
end sub

' Companion banner ad
sub showCompanionAd(adUrl as String, position as String)
  ' Show banner ad in UI
  m.global.bannerAd = {
    url: adUrl
    position: position
  }
end sub
