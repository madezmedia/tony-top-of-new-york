' ===========================================================
' HomeScene.brs — T.O.N.Y. Roku App (Pro Level)
' Features: Rich episode metadata, detail panel, deep linking,
' bookmarks, exit dialog, professional streaming UX
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
  m.heroMeta = m.top.findNode("heroMeta")

  ' Detail panel nodes
  m.detailPanel = m.top.findNode("detailPanel")
  m.detailTitle = m.top.findNode("detailTitle")
  m.detailDescription = m.top.findNode("detailDescription")
  m.detailMeta = m.top.findNode("detailMeta")
  m.detailRating = m.top.findNode("detailRating")

  m.isPlaying = false
  m.exitDialogShowing = false
  m.currentContentId = "episode-one"

  ' Mux playback ID
  m.muxPlaybackId = "GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko"

  ' Build catalog and populate UI
  buildContentCatalog()
  populateRowList()

  ' Observers
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

  m.contentRowList.setFocus(true)

  ' Show initial detail for first item
  updateDetailPanel("episode-one")
end sub

' -----------------------------------------------
' Rich Content Catalog
' -----------------------------------------------
sub buildContentCatalog()
  m.catalog = {}

  m.catalog["episode-one"] = {
    title: "Concrete Jungle",
    fullTitle: "S1:E1 — Concrete Jungle",
    description: "Michael Cortez returns to the Bronx after years away, only to find the neighborhood he left behind has changed — and the enemies he made haven't forgotten. When a routine visit turns deadly, Michael is pulled back into a world of loyalty, betrayal, and blood.",
    url: "https://stream.mux.com/" + m.muxPlaybackId + ".m3u8",
    streamFormat: "hls",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 5),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 5),
    duration: "45:22",
    episodeNum: "E1",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E1 • 45 min • TV-MA",
    available: true,
    isNew: true
  }

  m.catalog["episode-two"] = {
    title: "Blood Money",
    fullTitle: "S1:E2 — Blood Money",
    description: "Miss B tightens her grip on the Beaumont empire as a new supply route opens through the docks. Michael faces an impossible choice when Enrique demands loyalty that could cost him everything. Detective Cage starts connecting the dots.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 120),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 120),
    duration: "42:15",
    episodeNum: "E2",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E2 • 42 min • TV-MA",
    available: false,
    isNew: false
  }

  m.catalog["episode-three"] = {
    title: "Family Ties",
    fullTitle: "S1:E3 — Family Ties",
    description: "Rina discovers a secret that threatens to unravel both the Cortez and Beaumont families. Billy Black makes his move for the crown while Marisol fights to keep the family together. Loyalties are tested as the streets demand their due.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 240),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 240),
    duration: "47:33",
    episodeNum: "E3",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E3 • 47 min • TV-MA",
    available: false,
    isNew: false
  }

  m.catalog["episode-four"] = {
    title: "The Reckoning",
    fullTitle: "S1:E4 — The Reckoning",
    description: "Alliances shatter as the war between families reaches a breaking point. Michael must confront the demons of his past to protect the people he loves. In the Bronx, there are no clean hands — only survivors.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 360),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 360),
    duration: "51:08",
    episodeNum: "E4",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E4 • 51 min • TV-MA • Season Finale",
    available: false,
    isNew: false
  }

  m.catalog["bts-making-of"] = {
    title: "Making of T.O.N.Y.",
    fullTitle: "Behind the Scenes — Making of T.O.N.Y.",
    description: "Go behind the camera with creator Michael Steven-Paul as he brings his vision of the Bronx to life. From casting to location scouting, discover how an independent film became a streaming sensation.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 500),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 500),
    duration: "28:45",
    episodeNum: "",
    season: "Special",
    rating: "TV-14",
    meta: "Special • 28 min • TV-14",
    available: false,
    isNew: false
  }

  m.catalog["bts-cast-interviews"] = {
    title: "Cast Interviews",
    fullTitle: "Behind the Scenes — Cast Interviews",
    description: "Sit down with the cast of T.O.N.Y. as they reveal what it took to inhabit these complex characters. Michele White, Shana Bookman, Britton Carter, and Raymond Broadwater share the stories behind the stories.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 700),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 700),
    duration: "34:12",
    episodeNum: "",
    season: "Special",
    rating: "TV-14",
    meta: "Special • 34 min • TV-14",
    available: false,
    isNew: false
  }

  m.catalog["bts-bronx"] = {
    title: "On Set: The Bronx",
    fullTitle: "Behind the Scenes — On Set in The Bronx",
    description: "The Bronx is more than a backdrop — it's a character. Explore the real locations used in the series and meet the community that made filming possible. From rooftops to bodegas, every corner tells a story.",
    url: "",
    thumbnailUrl: muxThumb(m.muxPlaybackId, 240, 136, 900),
    heroUrl: muxThumb(m.muxPlaybackId, 1280, 400, 900),
    duration: "22:30",
    episodeNum: "",
    season: "Special",
    rating: "TV-G",
    meta: "Special • 22 min • TV-G",
    available: false,
    isNew: false
  }
end sub

function muxThumb(playbackId as string, w as integer, h as integer, time as integer) as string
  return "https://image.mux.com/" + playbackId + "/thumbnail.jpg?width=" + str(w).trim() + "&height=" + str(h).trim() + "&time=" + str(time).trim()
end function

' -----------------------------------------------
' Populate RowList with Rich Metadata
' -----------------------------------------------
sub populateRowList()
  content = CreateObject("roSGNode", "ContentNode")

  ' === ROW 1: Season 1 Episodes ===
  row1 = content.CreateChild("ContentNode")
  row1.title = "SEASON 1"
  addCatalogItem(row1, "episode-one")
  addCatalogItem(row1, "episode-two")
  addCatalogItem(row1, "episode-three")
  addCatalogItem(row1, "episode-four")

  ' === ROW 2: Behind the Scenes ===
  row2 = content.CreateChild("ContentNode")
  row2.title = "BEHIND THE SCENES"
  addCatalogItem(row2, "bts-making-of")
  addCatalogItem(row2, "bts-cast-interviews")
  addCatalogItem(row2, "bts-bronx")

  ' === ROW 3: Coming Soon — Season 2 ===
  row3 = content.CreateChild("ContentNode")
  row3.title = "COMING SOON — SEASON 2"
  addPlaceholder(row3, "New Blood", "S2:E1")
  addPlaceholder(row3, "Empire State", "S2:E2")
  addPlaceholder(row3, "The Takeover", "S2:E3")
  addPlaceholder(row3, "Crown Heights", "S2:E4")
  addPlaceholder(row3, "Endgame", "S2:E5")

  m.contentRowList.content = content
end sub

sub addCatalogItem(row as object, catalogKey as string)
  item = row.CreateChild("ContentNode")
  entry = m.catalog[catalogKey]
  item.title = entry.title
  item.HDPosterUrl = entry.thumbnailUrl
  item.id = catalogKey

  ' Pack metadata: episodeNum|duration|subtitle|flags
  flags = ""
  if entry.isNew then flags = "new"
  item.ShortDescriptionLine2 = entry.episodeNum + "|" + entry.duration + "|" + entry.season + "|" + flags

  if not entry.available
    item.description = "coming_soon"
  end if
end sub

sub addPlaceholder(row as object, title as string, epLabel as string)
  item = row.CreateChild("ContentNode")
  item.title = title
  item.HDPosterUrl = muxThumb(m.muxPlaybackId, 240, 136, int(rnd(0) * 1200))
  item.description = "coming_soon"
  item.id = "placeholder"
  item.ShortDescriptionLine2 = epLabel + "|--:--|Season 2|"
end sub

' -----------------------------------------------
' Detail Panel — Updates on Focus
' -----------------------------------------------
sub updateDetailPanel(catalogKey as string)
  if not m.catalog.DoesExist(catalogKey) then return

  entry = m.catalog[catalogKey]
  m.detailTitle.text = entry.fullTitle
  m.detailDescription.text = entry.description
  m.detailMeta.text = entry.meta
  m.detailRating.text = entry.rating

  ' Update hero image
  if entry.heroUrl <> invalid and entry.heroUrl <> ""
    m.heroPoster.uri = entry.heroUrl
  end if
end sub

sub onItemFocused()
  focused = m.contentRowList.rowItemFocused
  if focused = invalid then return

  rowIndex = focused[0]
  itemIndex = focused[1]

  row = m.contentRowList.content.getChild(rowIndex)
  if row = invalid then return

  item = row.getChild(itemIndex)
  if item = invalid then return

  catalogKey = item.id
  if catalogKey <> "placeholder" and m.catalog.DoesExist(catalogKey)
    updateDetailPanel(catalogKey)
    m.detailPanel.visible = true
  else
    ' Placeholder items — show generic Season 2 info
    m.detailTitle.text = "Season 2: " + item.title
    m.detailDescription.text = "The saga continues. New alliances. New enemies. The Bronx never sleeps."
    m.detailMeta.text = "Coming 2027"
    m.detailRating.text = "TV-MA"
    m.detailPanel.visible = true

    ' Use a different Mux frame for hero
    m.heroPoster.uri = muxThumb(m.muxPlaybackId, 1280, 400, 60 * itemIndex + 30)
  end if
end sub

' -----------------------------------------------
' Selection & Playback
' -----------------------------------------------
sub onItemSelected()
  selected = m.contentRowList.rowItemSelected
  if selected = invalid then return

  rowIndex = selected[0]
  itemIndex = selected[1]

  row = m.contentRowList.content.getChild(rowIndex)
  if row = invalid then return

  item = row.getChild(itemIndex)
  if item = invalid then return

  if item.description = "coming_soon"
    m.statusLabel.text = chr(9888) + "  " + item.title + " — Coming Soon!"
    return
  end if

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

' Deep linking
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

sub startPlayback()
  m.isPlaying = true
  m.spinner.visible = true
  m.statusLabel.text = ""
  m.detailPanel.visible = false

  content = CreateObject("roSGNode", "ContentNode")
  content.url = m.streamUrl
  content.title = m.catalog[m.currentContentId].fullTitle
  content.streamFormat = "hls"

  m.videoPlayer.content = content
  m.videoPlayer.visible = true
  m.videoPlayer.control = "play"
  m.videoPlayer.setFocus(true)

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
  m.detailPanel.visible = true
  m.contentRowList.setFocus(true)
end sub

' -----------------------------------------------
' Bookmarks
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
' Video State
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
    m.detailPanel.visible = true
    m.contentRowList.setFocus(true)
  end if
end sub

' -----------------------------------------------
' Remote Control
' -----------------------------------------------
function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false

  if m.exitDialogShowing
    m.exitDialog.visible = false
    m.exitDialogShowing = false
    m.contentRowList.setFocus(true)
    return true
  end if

  if key = "back" and m.isPlaying
    stopPlayback()
    return true
  end if

  if key = "back" and not m.isPlaying
    m.exitDialog.visible = true
    m.exitDialogShowing = true
    return false
  end if

  return false
end function
