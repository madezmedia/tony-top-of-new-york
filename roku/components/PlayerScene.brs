sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.errorLabel = m.top.findNode("errorLabel")

  m.videoPlayer.observeField("state", "onVideoStateChange")
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

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
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

  m.videoPlayer.content = content
  m.videoPlayer.control = "play"
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
