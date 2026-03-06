sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.errorLabel = m.top.findNode("errorLabel")

  m.videoPlayer.observeField("state", "onVideoStateChange")
  m.videoPlayer.observeField("position", "onPositionChange")
end sub

sub onEpisodeIdChange()
  episodeId = m.top.episodeId
  if episodeId <> "" then
    loadAndPlayEpisode(episodeId)
  end if
end sub

sub loadAndPlayEpisode(episodeId as string)
  m.loadingSpinner.visible = true
  m.errorLabel.visible = false

  ' Step 1: Fetch signed JWT from /api/roku-token
  tokenUrl = "https://tony-top-of-new-york.vercel.app/api/roku-token?episodeId=" + episodeId
  request = CreateObject("roUrlTransfer")
  request.setUrl(tokenUrl)
  request.setCertificatesFile("common:/certs/ca-bundle.crt")

  tokenResponse = request.GetToString()

  if tokenResponse = ""
    showError("Failed to load episode. Please try again.")
    return
  end if

  tokenData = ParseJson(tokenResponse)
  if tokenData = invalid or tokenData.streamUrl = invalid
    showError("Episode not available.")
    return
  end if

  ' Step 2: Build content node with signed stream URL
  content = CreateObject("roSGNode", "ContentNode")
  content.url = tokenData.streamUrl  ' Already includes ?token=JWT
  content.title = m.top.episodeTitle
  content.streamFormat = "hls"

  ' Step 3: Set up VAST pre-roll via roAdManager
  ' (Roku handles ad insertion before playback starts)
  content.adBreaks = [
    {
      offset: 0,
      ads: [{
        adServer: "https://tony-top-of-new-york.vercel.app/api/vast-tag"
      }]
    }
  ]

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
  m.loadingSpinner.visible = false
end sub

sub onVideoStateChange()
  state = m.videoPlayer.state
  if state = "error"
    showError("Playback error. Please try again.")
  else if state = "playing"
    m.loadingSpinner.visible = false
    m.errorLabel.visible = false
  end if
end sub

sub onPositionChange()
  ' Token refresh: if within 10 minutes of expiry, fetch a new token
  ' Simplified: refresh every 3.5 hours
  position = m.videoPlayer.position
  if position > 0 and Int(position) mod 12600 = 0  ' 3.5 * 3600
    loadAndPlayEpisode(m.top.episodeId)
  end if
end sub

sub showError(message as string)
  m.loadingSpinner.visible = false
  m.errorLabel.text = message
  m.errorLabel.visible = true
end sub
