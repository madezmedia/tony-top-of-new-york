' ===========================================================
' PlayerScene.brs — T.O.N.Y. Roku Video Player
' Plays public Mux HLS streams directly, no token needed.
' ===========================================================

sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.errorLabel = m.top.findNode("errorLabel")
  m.titleOverlay = m.top.findNode("titleOverlay")

  m.videoPlayer.observeField("state", "onVideoStateChange")
end sub

' This fires when episodeId is set (it must be set LAST after streamUrl)
sub onEpisodeIdChange()
  episodeId = m.top.episodeId
  streamUrl = m.top.streamUrl
  title = m.top.episodeTitle

  if episodeId = "" then return

  m.titleOverlay.text = title

  if streamUrl <> invalid and streamUrl <> "" then
    playVideo(streamUrl, title)
  else
    ' Fallback: try token fetch
    startTokenFetch(episodeId)
  end if
end sub

sub playVideo(url as string, title as string)
  m.loadingSpinner.visible = true
  m.errorLabel.visible = false

  content = CreateObject("roSGNode", "ContentNode")
  content.url = url
  content.title = title
  content.streamFormat = "hls"

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
  m.videoPlayer.setFocus(true)
end sub

sub startTokenFetch(episodeId as string)
  m.loadingSpinner.visible = true
  m.errorLabel.visible = false

  m.tokenTask = CreateObject("roSGNode", "TokenFetchTask")
  m.tokenTask.observeField("tokenData", "onTokenFetched")
  m.tokenTask.observeField("error", "onTokenError")
  m.tokenTask.episodeId = episodeId
  m.tokenTask.control = "RUN"
end sub

sub onTokenFetched()
  tokenData = m.tokenTask.tokenData
  if tokenData = invalid then return

  playVideo(tokenData.streamUrl, m.top.episodeTitle)

  m.tokenExpiresAt = tokenData.expiresAt
end sub

sub onTokenError()
  showError(m.tokenTask.error)
end sub

sub onVideoStateChange()
  state = m.videoPlayer.state
  if state = "error"
    showError("Playback error. Please try again.")
  else if state = "playing"
    m.loadingSpinner.visible = false
    m.errorLabel.visible = false
  else if state = "buffering"
    m.loadingSpinner.visible = true
  end if
end sub

sub showError(message as string)
  m.loadingSpinner.visible = false
  m.errorLabel.text = message
  m.errorLabel.visible = true
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  if press then
    if key = "back" then
      m.videoPlayer.control = "stop"
      m.top.visible = false
      m.top.getParent().setFocus(true)
      return true
    end if
  end if
  return false
end function
