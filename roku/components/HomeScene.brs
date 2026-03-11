' ===========================================================
' HomeScene.brs — T.O.N.Y. Roku App (Channel Store Ready)
' TV-style home screen with RowList, deep linking, bookmarks
' ===========================================================

sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.spinner = m.top.findNode("spinner")
  m.statusLabel = m.top.findNode("statusLabel")
  m.exitDialog = m.top.findNode("exitDialog")
  m.contentRowList = m.top.findNode("contentRowList")
  m.heroPoster = m.top.findNode("heroPoster")
  m.heroTitle = m.top.findNode("heroTitle")
  m.heroSubtitle = m.top.findNode("heroSubtitle")
  m.heroDescription = m.top.findNode("heroDescription")

  m.isPlaying = false
  m.exitDialogShowing = false

  ' Mux playback ID for dynamic thumbnail URLs
  m.muxPlaybackId = "GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko"

  ' Build content catalog
  buildContentCatalog()

  ' Populate the RowList with content rows
  populateRowList()

  ' Observe selections
  m.contentRowList.observeField("rowItemSelected", "onItemSelected")
  m.contentRowList.observeField("rowItemFocused", "onItemFocused")
  m.videoPlayer.observeField("state", "onVideoState")
  m.videoPlayer.observeField("position", "onVideoPosition")

  ' Load saved bookmark
  m.bookmarkPosition = 0
  section = CreateObject("roRegistrySection", "playback")
  if section.Exists("bookmark_episode-one")
    m.bookmarkPosition = val(section.Read("bookmark_episode-one"))
  end if

  ' Focus the RowList
  m.contentRowList.setFocus(true)
end sub

' -----------------------------------------------
' Content Catalog (expandable for future content)
' -----------------------------------------------
sub buildContentCatalog()
  m.catalog = {}

  m.catalog["episode-one"] = {
    title: "Ep 1: Concrete Jungle",
    url: "https://stream.mux.com/" + m.muxPlaybackId + ".m3u8",
    streamFormat: "hls",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 5),
    available: true
  }

  m.catalog["episode-two"] = {
    title: "Ep 2: Blood Money",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 60),
    available: false
  }

  m.catalog["episode-three"] = {
    title: "Ep 3: Family Ties",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 120),
    available: false
  }

  m.catalog["episode-four"] = {
    title: "Ep 4: The Reckoning",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 180),
    available: false
  }

  m.catalog["bts-making-of"] = {
    title: "Making of T.O.N.Y.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 300),
    available: false
  }

  m.catalog["bts-cast-interviews"] = {
    title: "Cast Interviews",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 600),
    available: false
  }

  m.catalog["bts-on-set"] = {
    title: "On Set: The Bronx",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 900),
    available: false
  }
end sub

' Dynamic Mux thumbnail helper (responsive to any size)
function muxThumb(playbackId as string, w as integer, h as integer, time as integer) as string
  return "https://image.mux.com/" + playbackId + "/thumbnail.jpg?width=" + str(w).trim() + "&height=" + str(h).trim() + "&time=" + str(time).trim()
end function

' -----------------------------------------------
' Populate RowList Rows
' -----------------------------------------------
sub populateRowList()
  content = CreateObject("roSGNode", "ContentNode")

  ' === ROW 1: Featured — Season 1 Episodes ===
  row1 = content.CreateChild("ContentNode")
  row1.title = "SEASON 1"

  addItem(row1, "episode-one")
  addItem(row1, "episode-two")
  addItem(row1, "episode-three")
  addItem(row1, "episode-four")

  ' === ROW 2: Behind the Scenes ===
  row2 = content.CreateChild("ContentNode")
  row2.title = "BEHIND THE SCENES"

  addItem(row2, "bts-making-of")
  addItem(row2, "bts-cast-interviews")
  addItem(row2, "bts-on-set")

  ' === ROW 3: Coming Soon — Season 2 ===
  row3 = content.CreateChild("ContentNode")
  row3.title = "COMING SOON — SEASON 2"

  addPlaceholder(row3, "S2 Ep 1: New Blood")
  addPlaceholder(row3, "S2 Ep 2: Empire State")
  addPlaceholder(row3, "S2 Ep 3: The Takeover")
  addPlaceholder(row3, "S2 Ep 4: Endgame")

  m.contentRowList.content = content
end sub

sub addItem(row as object, catalogKey as string)
  item = row.CreateChild("ContentNode")
  entry = m.catalog[catalogKey]
  item.title = entry.title
  item.HDPosterUrl = entry.thumbnailUrl
  item.id = catalogKey
  if not entry.available
    item.description = "coming_soon"
  end if
end sub

sub addPlaceholder(row as object, title as string)
  item = row.CreateChild("ContentNode")
  item.title = title
  item.HDPosterUrl = muxThumb(m.muxPlaybackId, 240, 136, int(rnd(0) * 1000))
  item.description = "coming_soon"
  item.id = "placeholder"
end sub

' -----------------------------------------------
' Navigation & Selection
' -----------------------------------------------
sub onItemFocused()
  focused = m.contentRowList.rowItemFocused
  if focused = invalid then return

  rowIndex = focused[0]
  itemIndex = focused[1]

  ' Update hero based on focused item (row 0 = season 1)
  if rowIndex = 0
    row = m.contentRowList.content.getChild(0)
    if row <> invalid
      item = row.getChild(itemIndex)
      if item <> invalid
        ' Update hero poster to focused episode
        m.heroPoster.uri = "https://image.mux.com/" + m.muxPlaybackId + "/thumbnail.jpg?width=1280&height=400&time=" + str(itemIndex * 60).trim()
        m.heroDescription.text = item.title
      end if
    end if
  end if
end sub

sub onItemSelected()
  selected = m.contentRowList.rowItemSelected
  if selected = invalid then return

  rowIndex = selected[0]
  itemIndex = selected[1]

  row = m.contentRowList.content.getChild(rowIndex)
  if row = invalid then return

  item = row.getChild(itemIndex)
  if item = invalid then return

  ' Check if content is available
  if item.description = "coming_soon"
    m.statusLabel.text = item.title + " — Coming Soon!"
    return
  end if

  ' Play the selected content
  catalogKey = item.id
  if m.catalog.DoesExist(catalogKey)
    entry = m.catalog[catalogKey]
    if entry.available and entry.url <> ""
      m.currentContentId = catalogKey
      m.streamUrl = entry.url
      startPlayback()
    end if
  end if
end sub

' -----------------------------------------------
' Deep Linking (required for certification)
' -----------------------------------------------
sub onDeepLink()
  contentId = m.top.deepLinkContentId
  if contentId <> invalid and contentId <> ""
    m.currentContentId = contentId
    if m.catalog.DoesExist(contentId) and m.catalog[contentId].available
      m.streamUrl = m.catalog[contentId].url
      startPlayback()
    end if
  end if
end sub

' -----------------------------------------------
' Playback Control
' -----------------------------------------------
sub startPlayback()
  m.isPlaying = true
  m.spinner.visible = true
  m.statusLabel.text = ""

  content = CreateObject("roSGNode", "ContentNode")
  content.url = m.streamUrl
  content.title = m.catalog[m.currentContentId].title
  content.streamFormat = "hls"

  m.videoPlayer.content = content
  m.videoPlayer.visible = true
  m.videoPlayer.control = "play"
  m.videoPlayer.setFocus(true)

  ' Resume from bookmark if available
  if m.bookmarkPosition > 30 and m.currentContentId = "episode-one"
    m.videoPlayer.seek = m.bookmarkPosition
  end if
end sub

sub stopPlayback()
  saveBookmark()
  m.videoPlayer.control = "stop"
  m.videoPlayer.visible = false
  m.isPlaying = false
  m.spinner.visible = false
  m.statusLabel.text = ""
  m.contentRowList.setFocus(true)
end sub

' -----------------------------------------------
' Bookmark System (required for content > 15 min)
' -----------------------------------------------
sub onVideoPosition()
  position = m.videoPlayer.position
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
' Video State Machine
' -----------------------------------------------
sub onVideoState()
  state = m.videoPlayer.state
  if state = "playing"
    m.spinner.visible = false
  else if state = "buffering"
    m.spinner.visible = true
  else if state = "finished"
    clearBookmark()
    stopPlayback()
  else if state = "error"
    m.spinner.visible = false
    m.statusLabel.text = "Unable to play. Press Back to return."
    m.videoPlayer.visible = false
    m.isPlaying = false
    m.contentRowList.setFocus(true)
  end if
end sub

' -----------------------------------------------
' Remote Control Handler
' -----------------------------------------------
function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false

  ' Exit dialog handling
  if m.exitDialogShowing
    m.exitDialog.visible = false
    m.exitDialogShowing = false
    m.contentRowList.setFocus(true)
    return true
  end if

  ' Back while playing — stop video, return to home
  if key = "back" and m.isPlaying
    stopPlayback()
    return true
  end if

  ' Back on home screen — show exit dialog
  if key = "back" and not m.isPlaying
    m.exitDialog.visible = true
    m.exitDialogShowing = true
    return false
  end if

  return false
end function
