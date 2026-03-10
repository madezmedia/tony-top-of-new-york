sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.errorLabel = m.top.findNode("errorLabel")

  m.videoPlayer.observeField("state", "onVideoStateChange")

  ' Initialize Mux Analytics Task
  m.mux = m.top.CreateNode("MuxTask")
  m.mux.setField("video", m.videoPlayer)
end sub

sub onEpisodeIdChange()
  episodeId = m.top.episodeId
  streamUrl = m.top.streamUrl
  if episodeId <> "" AND streamUrl <> "" then
    playPublicVideo(streamUrl)
  else if episodeId <> "" then
    ' Fallback: try token fetch if no public URL
    startTokenFetch(episodeId)
  end if
end sub

sub playPublicVideo(url as string)
  m.loadingSpinner.visible = true
  m.errorLabel.visible = false

  content = CreateObject("roSGNode", "ContentNode")
  content.url = url
  content.title = m.top.episodeTitle
  content.streamFormat = "hls"

  setupMuxAnalytics(m.top.episodeTitle)

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
  m.videoPlayer.setFocus(true)
  m.loadingSpinner.visible = false
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

  content = CreateObject("roSGNode", "ContentNode")
  content.url = tokenData.streamUrl
  content.title = m.top.episodeTitle
  content.streamFormat = "hls"

  setupMuxAnalytics(m.top.episodeTitle)

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
  m.videoPlayer.setFocus(true)
  m.loadingSpinner.visible = false

  ' Store expiresAt for token refresh check
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
  end if
end sub

sub showError(message as string)
  m.loadingSpinner.visible = false
  m.errorLabel.text = message
  m.errorLabel.visible = true
end sub

function playContent(args as object) as void
  m.top.getScene().callFunc("playEpisode", {id: args.contentId, title: ""})
end function

sub setupMuxAnalytics(videoTitle as string)
  muxConfig = {
    ' NOTE: In a real app, inject this via token or build process
    ' We configure an arbitrary key here to allow the task to run without crashing,
    ' You must replace it with your MUX_ENV_KEY
    env_key: "bftb17q0qg5j34bhe6f88iudf", 
    player_name: "T.O.N.Y. Roku App",
    video_id: m.top.episodeId,
    video_title: videoTitle
  }
  m.mux.setField("config", muxConfig)
  m.mux.control = "RUN"
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  handled = false
  if press then
    if key = "back" then
      m.videoPlayer.control = "stop"
      m.top.visible = false
      m.top.getParent().setFocus(true)
      handled = true
    end if
  end if
  return handled
end function
