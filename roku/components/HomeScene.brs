' ===========================================================
' HomeScene.brs — MINIMAL T.O.N.Y. Roku Player
' No grids, no feeds, no focus chains.
' Just: Press OK → Play video
' ===========================================================

sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.spinner = m.top.findNode("spinner")
  m.statusLabel = m.top.findNode("statusLabel")
  m.playPrompt = m.top.findNode("playPrompt")

  m.isPlaying = false

  ' Hardcoded public Mux stream URL
  m.streamUrl = "https://stream.mux.com/GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko.m3u8"

  m.videoPlayer.observeField("state", "onVideoState")

  ' The Scene itself handles all key events — no grid focus needed
  m.statusLabel.text = "Ready"
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false

  if key = "OK" and not m.isPlaying
    ' PLAY THE VIDEO
    m.isPlaying = true
    m.playPrompt.visible = false
    m.spinner.visible = true
    m.statusLabel.text = "Loading video..."

    content = CreateObject("roSGNode", "ContentNode")
    content.url = m.streamUrl
    content.title = "T.O.N.Y. Episode 1"
    content.streamFormat = "hls"

    m.videoPlayer.content = content
    m.videoPlayer.visible = true
    m.videoPlayer.control = "play"
    m.videoPlayer.setFocus(true)
    return true
  end if

  if key = "back" and m.isPlaying
    ' STOP AND RETURN TO HOME
    m.videoPlayer.control = "stop"
    m.videoPlayer.visible = false
    m.isPlaying = false
    m.playPrompt.visible = true
    m.spinner.visible = false
    m.statusLabel.text = "Ready"
    return true
  end if

  return false
end function

sub onVideoState()
  state = m.videoPlayer.state
  m.statusLabel.text = "Video: " + state

  if state = "playing"
    m.spinner.visible = false
  else if state = "buffering"
    m.spinner.visible = true
  else if state = "error"
    m.spinner.visible = false
    m.statusLabel.text = "Playback error"
    m.videoPlayer.visible = false
    m.isPlaying = false
    m.playPrompt.visible = true
  end if
end sub
