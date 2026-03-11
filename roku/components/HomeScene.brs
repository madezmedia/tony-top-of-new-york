' ===========================================================
' HomeScene.brs — T.O.N.Y. Roku App (Channel Store Ready)
' Features: Deep linking, exit dialog, bookmarks, error recovery
' ===========================================================

sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.spinner = m.top.findNode("spinner")
  m.statusLabel = m.top.findNode("statusLabel")
  m.playPrompt = m.top.findNode("playPrompt")
  m.exitDialog = m.top.findNode("exitDialog")

  m.isPlaying = false
  m.exitDialogShowing = false

  ' Content catalog (expandable)
  m.catalog = {}
  m.catalog["episode-one"] = {
    title: "T.O.N.Y. Episode 1 — Concrete Jungle",
    url: "https://stream.mux.com/GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko.m3u8",
    streamFormat: "hls"
  }

  ' Default content
  m.currentContentId = "episode-one"
  m.streamUrl = m.catalog["episode-one"].url

  ' Observe video state for buffering/error/finished handling
  m.videoPlayer.observeField("state", "onVideoState")
  m.videoPlayer.observeField("position", "onVideoPosition")

  ' Load saved bookmark position (resume playback)
  m.bookmarkPosition = 0
  section = CreateObject("roRegistrySection", "playback")
  if section.Exists("bookmark_" + m.currentContentId)
    bookmarkStr = section.Read("bookmark_" + m.currentContentId)
    m.bookmarkPosition = val(bookmarkStr)
  end if

  ' Scene focus for remote input
  m.top.setFocus(true)
  m.statusLabel.text = ""

  ' Show resume prompt if bookmark exists
  if m.bookmarkPosition > 30
    minutes = int(m.bookmarkPosition / 60)
    m.playPrompt.text = "▶  RESUME FROM " + str(minutes).trim() + " MIN  |  OK TO PLAY"
  end if
end sub

' -----------------------------------------------
' Deep Linking Handler (required for certification)
' -----------------------------------------------
sub onDeepLink()
  contentId = m.top.deepLinkContentId
  mediaType = m.top.deepLinkMediaType

  if contentId <> invalid and contentId <> ""
    m.currentContentId = contentId

    ' Look up content in catalog
    if m.catalog.DoesExist(contentId)
      m.streamUrl = m.catalog[contentId].url
    end if

    ' Auto-play on deep link (Direct to Play)
    startPlayback()
  end if
end sub

' -----------------------------------------------
' Playback Control
' -----------------------------------------------
sub startPlayback()
  m.isPlaying = true
  m.playPrompt.visible = false
  m.spinner.visible = true
  m.statusLabel.text = "Loading..."

  content = CreateObject("roSGNode", "ContentNode")
  content.url = m.streamUrl
  content.title = "T.O.N.Y. Episode 1"
  content.streamFormat = "hls"

  m.videoPlayer.content = content
  m.videoPlayer.visible = true
  m.videoPlayer.control = "play"
  m.videoPlayer.setFocus(true)

  ' Resume from bookmark if available
  if m.bookmarkPosition > 30
    m.videoPlayer.seek = m.bookmarkPosition
  end if
end sub

sub stopPlayback()
  ' Save bookmark before stopping
  saveBookmark()

  m.videoPlayer.control = "stop"
  m.videoPlayer.visible = false
  m.isPlaying = false
  m.playPrompt.visible = true
  m.playPrompt.text = "▶  PRESS OK TO PLAY"
  m.spinner.visible = false
  m.statusLabel.text = ""
  m.top.setFocus(true)
end sub

' -----------------------------------------------
' Bookmark System (required for content > 15 min)
' -----------------------------------------------
sub onVideoPosition()
  position = m.videoPlayer.position
  ' Save bookmark every 30 seconds
  if position > 0 and int(position) mod 30 = 0
    m.bookmarkPosition = position
    saveBookmark()
  end if
end sub

sub saveBookmark()
  if m.bookmarkPosition > 10
    section = CreateObject("roRegistrySection", "playback")
    section.Write("bookmark_" + m.currentContentId, str(m.bookmarkPosition).trim())
    section.Flush()
  end if
end sub

sub clearBookmark()
  section = CreateObject("roRegistrySection", "playback")
  section.Delete("bookmark_" + m.currentContentId)
  section.Flush()
  m.bookmarkPosition = 0
end sub

' -----------------------------------------------
' Video State Handler
' -----------------------------------------------
sub onVideoState()
  state = m.videoPlayer.state

  if state = "playing"
    m.spinner.visible = false
    m.statusLabel.text = ""
  else if state = "buffering"
    m.spinner.visible = true
  else if state = "finished"
    ' Clear bookmark at end, return to home
    clearBookmark()
    stopPlayback()
    m.statusLabel.text = "Playback complete"
  else if state = "error"
    m.spinner.visible = false
    m.statusLabel.text = "Unable to play video. Press OK to retry."
    m.videoPlayer.visible = false
    m.isPlaying = false
    m.playPrompt.visible = true
    m.playPrompt.text = "▶  PRESS OK TO RETRY"
    m.top.setFocus(true)
  end if
end sub

' -----------------------------------------------
' Remote Control Key Handler
' -----------------------------------------------
function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false

  ' Handle exit dialog buttons
  if m.exitDialogShowing
    if key = "OK" or key = "back"
      m.exitDialog.visible = false
      m.exitDialogShowing = false
      m.top.setFocus(true)
      return true
    end if
  end if

  ' OK button — play or retry
  if key = "OK" and not m.isPlaying
    startPlayback()
    return true
  end if

  ' Back button while playing — stop and go home
  if key = "back" and m.isPlaying
    stopPlayback()
    return true
  end if

  ' Back button on home screen — show exit confirmation
  if key = "back" and not m.isPlaying
    m.exitDialog.visible = true
    m.exitDialogShowing = true
    return false  ' Return false to allow Roku to handle exit
  end if

  return false
end function
