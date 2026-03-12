' ===========================================================
' HomeScene.brs — T.O.N.Y. Roku App (Pro Level)
' Features: Netflix-style trailer auto-play, rich metadata,
' deep linking, bookmarks, exit dialog
' ===========================================================

sub init()
  m.videoPlayer = m.top.findNode("videoPlayer")
  m.bgTrailer = m.top.findNode("bgTrailer")
  m.spinner = m.top.findNode("spinner")
  m.statusLabel = m.top.findNode("statusLabel")
  m.exitDialog = m.top.findNode("exitDialog")
  m.contentRowList = m.top.findNode("contentRowList")
  m.heroPoster = m.top.findNode("heroPoster")
  m.heroLogo = m.top.findNode("heroLogo")
  m.heroSubtitle = m.top.findNode("heroSubtitle")
  m.heroDescription = m.top.findNode("heroDescription")
  m.heroMeta = m.top.findNode("heroMeta")
  m.detailPanel = m.top.findNode("detailPanel")
  m.detailTitle = m.top.findNode("detailTitle")
  m.detailDescription = m.top.findNode("detailDescription")
  m.detailMeta = m.top.findNode("detailMeta")
  m.detailRating = m.top.findNode("detailRating")
  m.playHint = m.top.findNode("playHint")
  
  ' Account/Activation Nodes
  m.accountBtnBg = m.top.findNode("accountBtnBg")
  m.accountBtnText = m.top.findNode("accountBtnText")
  m.accountScene = m.top.findNode("accountScene")
  m.accountScene.observeField("authCompleted", "onAuthCompleted")

  ' Roku Pay In-App Billing
  m.channelStore = m.top.findNode("channelStore")
  m.channelStore.observeField("purchases", "onGetPurchases")
  m.channelStore.observeField("orderStatus", "onOrderStatus")
  
  m.rokuPaySKU = "tony_season_1_pass"
  m.hasRokuPass = false
  m.channelStore.command = "getPurchases"

  m.isPlaying = false
  m.exitDialogShowing = false
  m.bgTrailerPlaying = false
  m.currentContentId = "episode-one"
  m.isLoggedIn = false
  m.accessToken = ""
  m.isCheckingEntitlement = false

  ' Check for saved login token
  checkLoginStatus()

  ' Mux playback IDs
  m.muxEpisode1 = "GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko"
  m.muxTrailer = "kUwvJd9lCQwuqYhRvjLP8u2dWkn00Lsm6zN983GFNY5I"

  buildContentCatalog()
  populateRowList()

  ' Observers
  m.contentRowList.observeField("rowItemSelected", "onItemSelected")
  m.contentRowList.observeField("rowItemFocused", "onItemFocused")
  m.videoPlayer.observeField("state", "onVideoState")
  m.videoPlayer.observeField("position", "onVideoPosition")
  m.bgTrailer.observeField("state", "onBgTrailerState")

  ' Load saved bookmark
  m.bookmarkPosition = 0
  section = CreateObject("roRegistrySection", "playback")
  if section.Exists("bookmark_episode-one")
    m.bookmarkPosition = val(section.Read("bookmark_episode-one"))
  end if

  m.contentRowList.setFocus(true)
  updateDetailPanel("episode-one")

  ' Start background trailer after a short delay
  m.trailerTimer = CreateObject("roSGNode", "Timer")
  m.trailerTimer.duration = 2
  m.trailerTimer.repeat = false
  m.trailerTimer.observeField("fire", "startBgTrailer")
  m.trailerTimer.control = "start"
end sub

' -----------------------------------------------
' Authentication & Entitlements
' -----------------------------------------------
sub checkLoginStatus()
  section = CreateObject("roRegistrySection", "auth")
  if section.Exists("access_token")
    m.accessToken = section.Read("access_token")
    m.isLoggedIn = true
    m.accountBtnText.text = "MY ACCOUNT"
    m.accountBtnBg.color = "#E61025" ' Red for logged in
  else
    m.isLoggedIn = false
    m.accessToken = ""
    m.accountBtnText.text = "SIGN IN"
    m.accountBtnBg.color = "#E61025" ' Red for guest
  end if
end sub

sub onAuthCompleted()
  if m.accountScene.authCompleted
    m.accountScene.visible = false
    checkLoginStatus()
    populateRowList() ' Refresh rows to show/hide Library and Continue Watching
    m.contentRowList.setFocus(true)
  end if
end sub

' -----------------------------------------------
' Background Trailer (Netflix-style auto-play)
' -----------------------------------------------
sub startBgTrailer()
  if m.isPlaying then return
  content = CreateObject("roSGNode", "ContentNode")
  content.url = "https://stream.mux.com/" + m.muxTrailer + ".m3u8"
  content.title = "T.O.N.Y. Trailer"
  content.streamFormat = "hls"

  m.bgTrailer.content = content
  m.bgTrailer.control = "play"
  m.bgTrailer.visible = true
  m.bgTrailerPlaying = true
  ' Hide the poster once trailer starts
end sub

sub stopBgTrailer()
  if m.bgTrailerPlaying
    m.bgTrailer.control = "stop"
    m.bgTrailer.visible = false
    m.bgTrailerPlaying = false
    m.heroPoster.visible = true
  end if
end sub

sub onBgTrailerState()
  state = m.bgTrailer.state
  if state = "playing"
    ' Hide poster, show trailer
    m.heroPoster.visible = false
  else if state = "error" or state = "finished"
    ' Fallback to poster
    m.heroPoster.visible = true
    m.bgTrailer.visible = false
    m.bgTrailerPlaying = false
  end if
end sub

' -----------------------------------------------
' Roku Pay (ChannelStore)
' -----------------------------------------------
sub onGetPurchases()
  purchases = m.channelStore.purchases
  if purchases = invalid then return

  ' Handle both Array and ContentNode types
  if type(purchases) = "roArray"
    for each purchase in purchases
      if purchase.code = m.rokuPaySKU
        m.hasRokuPass = true
        exit for
      end if
    end for
  else if type(purchases) = "roSGNode"
    for each purchase in purchases.getChildren(-1, 0)
      if purchase.code = m.rokuPaySKU
        m.hasRokuPass = true
        exit for
      end if
    end for
  end if
end sub

sub onOrderStatus()
  if m.channelStore.orderStatus <> invalid
    status = m.channelStore.orderStatus
    if status.status = 1 ' Success
      m.hasRokuPass = true
      m.statusLabel.text = ""
      ' Automatically play the content they just tried to purchase
      if m.currentContentId <> invalid and m.currentContentId <> "" and m.catalog.DoesExist(m.currentContentId)
        m.streamUrl = m.catalog[m.currentContentId].url
        stopBgTrailer()
        startPlayback()
      end if
    else
      m.statusLabel.text = chr(9888) + " Purchase cancelled or failed."
    end if
  end if
end sub

' -----------------------------------------------
' Content Catalog
' -----------------------------------------------
sub buildContentCatalog()
  m.catalog = {}

  ' Trailer Mux ID for thumbnails
  trailerThumb = "https://image.mux.com/" + m.muxTrailer + "/thumbnail.jpg"
  ep1Thumb = "https://image.mux.com/" + m.muxEpisode1 + "/thumbnail.jpg"

  m.catalog["episode-one"] = {
    title: "Concrete Jungle",
    fullTitle: "S1:E1 — Concrete Jungle",
    description: "Michael Cortez returns to the Bronx after years away, only to find the neighborhood he left behind has changed — and the enemies he made haven't forgotten. When a routine visit turns deadly, Michael is pulled back into a world of loyalty, betrayal, and blood.",
    url: "https://stream.mux.com/" + m.muxEpisode1 + ".m3u8",
    streamFormat: "hls",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=5",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=5",
    duration: "2h 12m",
    episodeNum: "E1",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E1 • 2h 12m • TV-MA",
    available: true,
    isNew: true
  }

  m.catalog["trailer"] = {
    title: "Official Trailer",
    fullTitle: "T.O.N.Y. — Official Trailer",
    description: "Watch the official trailer for T.O.N.Y. Top of New York. In the unforgiving streets of the Bronx, power is earned and survival comes at a cost. A Michael Steven-Paul crime saga.",
    url: "https://stream.mux.com/" + m.muxTrailer + ".m3u8",
    streamFormat: "hls",
    thumbnailUrl: trailerThumb + "?width=240&height=136&time=3",
    heroUrl: trailerThumb + "?width=1280&height=400&time=3",
    duration: "TBD",
    episodeNum: "",
    season: "Trailer",
    rating: "TV-MA",
    meta: "Official Trailer • TV-MA",
    available: true,
    isNew: true
  }

  m.catalog["episode-two"] = {
    title: "Blood Money",
    fullTitle: "S1:E2 — Blood Money",
    description: "Miss B tightens her grip on the Beaumont empire as a new supply route opens through the docks. Michael faces an impossible choice when Enrique demands loyalty that could cost him everything.",
    url: "https://stream.mux.com/" + m.muxEpisode1 + ".m3u8",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=120",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=120",
    duration: "2h 4m",
    episodeNum: "E2",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E2 • 2h 4m • TV-MA",
    available: true,
    isPremium: true,
    isNew: false
  }

  m.catalog["episode-three"] = {
    title: "Family Ties",
    fullTitle: "S1:E3 — Family Ties",
    description: "Rina discovers a secret that threatens to unravel both the Cortez and Beaumont families. Billy Black makes his move for the crown while Marisol fights to keep the family together.",
    url: "",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=240",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=240",
    duration: "TBD",
    episodeNum: "E3",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E3 • TV-MA • Coming Soon",
    available: false,
    isPremium: true,
    isNew: false
  }

  m.catalog["episode-four"] = {
    title: "The Reckoning",
    fullTitle: "S1:E4 — The Reckoning",
    description: "Alliances shatter as the war between families reaches a breaking point. Michael must confront the demons of his past. In the Bronx, there are no clean hands — only survivors.",
    url: "",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=360",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=360",
    duration: "TBD",
    episodeNum: "E4",
    season: "Season 1",
    rating: "TV-MA",
    meta: "S1:E4 • TV-MA • Season Finale • Coming Soon",
    available: false,
    isPremium: true,
    isNew: false
  }

  m.catalog["bts-making-of"] = {
    title: "Making of T.O.N.Y.",
    fullTitle: "Behind the Scenes — Making of T.O.N.Y.",
    description: "Go behind the camera with creator Michael Steven-Paul as he brings his vision of the Bronx to life. From casting to location scouting, discover how an independent film became a streaming sensation.",
    url: "",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=500",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=500",
    duration: "TBD",
    episodeNum: "",
    season: "Special",
    rating: "TV-14",
    meta: "Special • TV-14",
    available: false,
    isNew: false
  }

  m.catalog["bts-cast-interviews"] = {
    title: "Cast Interviews",
    fullTitle: "Behind the Scenes — Cast Interviews",
    description: "Sit down with the cast of T.O.N.Y. as they reveal what it took to inhabit these complex characters. Michele White, Shana Bookman, Britton Carter, and Raymond Broadwater share the stories behind the stories.",
    url: "",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=700",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=700",
    duration: "TBD",
    episodeNum: "",
    season: "Special",
    rating: "TV-14",
    meta: "Special • TV-14",
    available: false,
    isNew: false
  }

  m.catalog["bts-bronx"] = {
    title: "On Set: The Bronx",
    fullTitle: "Behind the Scenes — On Set in The Bronx",
    description: "The Bronx is more than a backdrop — it's a character. Explore the real locations used in the series and meet the community that made filming possible.",
    url: "",
    thumbnailUrl: ep1Thumb + "?width=240&height=136&time=900",
    heroUrl: ep1Thumb + "?width=1280&height=400&time=900",
    duration: "TBD",
    episodeNum: "",
    season: "Special",
    rating: "TV-G",
    meta: "Special • TV-G",
    available: false,
    isNew: false
  }
end sub

function muxThumb(playbackId as string, w as integer, h as integer, time as integer) as string
  return "https://image.mux.com/" + playbackId + "/thumbnail.jpg?width=" + str(w).trim() + "&height=" + str(h).trim() + "&time=" + str(time).trim()
end function

' -----------------------------------------------
' Populate RowList
' -----------------------------------------------
sub populateRowList()
  content = CreateObject("roSGNode", "ContentNode")

  ' === ROW: Continue Watching (Dynamic) ===
  ' We check for any bookmarks in registry
  section = CreateObject("roRegistrySection", "playback")
  hasBookmarks = false
  for each key in m.catalog
    if section.Exists("bookmark_" + key)
      hasBookmarks = true
      exit for
    end if
  end for

  if hasBookmarks
    rowCW = content.CreateChild("ContentNode")
    rowCW.title = "CONTINUE WATCHING"
    for each key in m.catalog
      if section.Exists("bookmark_" + key)
        addCatalogItem(rowCW, key)
      end if
    end for
  end if

  ' === ROW: My Library (Only for Logged-In / Purchasers) ===
  if m.isLoggedIn or m.hasRokuPass
    rowLib = content.CreateChild("ContentNode")
    rowLib.title = "MY ACCOUNT / LIBRARY"
    addCatalogItem(rowLib, "episode-one")
    addCatalogItem(rowLib, "episode-two")
    ' For a real app, this would only include purchased ContentIds
  end if

  ' === ROW: Featured (Static) ===
  rowFeatured = content.CreateChild("ContentNode")
  rowFeatured.title = "FEATURED"
  addCatalogItem(rowFeatured, "trailer")
  addCatalogItem(rowFeatured, "episode-one")

  ' === ROW: All Season 1 Episodes ===
  rowS1 = content.CreateChild("ContentNode")
  rowS1.title = "SEASON 1"
  addCatalogItem(rowS1, "episode-one")
  addCatalogItem(rowS1, "episode-two")
  addCatalogItem(rowS1, "episode-three")
  addCatalogItem(rowS1, "episode-four")

  ' === ROW: Behind the Scenes ===
  rowBTS = content.CreateChild("ContentNode")
  rowBTS.title = "BEHIND THE SCENES"
  addCatalogItem(rowBTS, "bts-making-of")
  addCatalogItem(rowBTS, "bts-cast-interviews")
  addCatalogItem(rowBTS, "bts-bronx")

  m.contentRowList.content = content
end sub

sub addCatalogItem(row as object, catalogKey as string)
  item = row.CreateChild("ContentNode")
  entry = m.catalog[catalogKey]
  item.title = entry.title
  item.HDPosterUrl = entry.thumbnailUrl
  item.id = catalogKey
  
  flags = ""
  if entry.isNew then flags += "new,"
  if entry.isPremium then flags += "premium,"
  
  ' LOCK LOGIC: Lock if premium AND not logged in AND doesn't have Roku pass
  if entry.isPremium and not m.isLoggedIn and not m.hasRokuPass
    flags += "locked,"
  end if
  
  item.ShortDescriptionLine2 = entry.episodeNum + "|" + entry.duration + "|" + entry.season + "|" + flags
  if not entry.available
    item.description = "coming_soon"
  end if
end sub

sub addPlaceholder(row as object, title as string, epLabel as string)
  item = row.CreateChild("ContentNode")
  item.title = title
  item.HDPosterUrl = muxThumb(m.muxEpisode1, 240, 136, int(rnd(0) * 1200))
  item.description = "coming_soon"
  item.id = "placeholder"
  item.ShortDescriptionLine2 = epLabel + "|TBD|Season 2|"
end sub

' -----------------------------------------------
' Detail Panel
' -----------------------------------------------
sub updateDetailPanel(catalogKey as string)
  if not m.catalog.DoesExist(catalogKey) then return
  entry = m.catalog[catalogKey]
  m.detailTitle.text = entry.fullTitle
  m.detailDescription.text = entry.description
  m.detailMeta.text = entry.meta
  m.detailRating.text = entry.rating

  if entry.heroUrl <> invalid and entry.heroUrl <> ""
    m.heroPoster.uri = entry.heroUrl
  end if

  ' Update play hint
  if catalogKey = "trailer"
    m.playHint.text = "OK to Play Trailer"
  else if entry.available
    m.playHint.text = "OK to Play  •  ★ Watch Trailer"
  else
    m.playHint.text = "Coming Soon"
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
    m.detailTitle.text = "Season 2: " + item.title
    m.detailDescription.text = "The saga continues. New alliances. New enemies. The Bronx never sleeps."
    m.detailMeta.text = "Coming 2027"
    m.detailRating.text = "TV-MA"
    m.detailPanel.visible = true
    m.heroPoster.uri = muxThumb(m.muxEpisode1, 1280, 400, 60 * itemIndex + 30)
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
    
    ' FREEMIUM LOGIC: Episode 1 & Trailers are free. Ep2+ require Auth Check or Roku Pass.
    if entry.isPremium <> true or catalogKey = "episode-one" or catalogKey = "trailer" or catalogKey.instr("bts-") >= 0
      if entry.available and entry.url <> ""
        m.currentContentId = catalogKey
        m.streamUrl = entry.url
        stopBgTrailer()
        startPlayback()
      end if
    else
      ' It's premium content. Check native Roku purchases AND login status.
      if m.hasRokuPass or m.isLoggedIn
        if entry.available and entry.url <> ""
          m.currentContentId = catalogKey
          m.streamUrl = entry.url
          stopBgTrailer()
          startPlayback()
        else
          m.statusLabel.text = chr(9888) + "  This episode is coming soon."
        end if
      else
        ' Prompt native Roku purchase as the first option for guests
        m.currentContentId = catalogKey
        m.statusLabel.text = "This is premium content. Please Sign In or Purchase."
        m.channelStore.order = [{ code: m.rokuPaySKU, qty: 1 }]
        m.channelStore.command = "doOrder"
      end if
    end if
  end if
end sub

sub onDeepLink()
  contentId = m.top.deepLinkContentId
  if contentId <> invalid and contentId <> ""
    m.currentContentId = contentId
    if m.catalog.DoesExist(contentId) and m.catalog[contentId].available
      m.streamUrl = m.catalog[contentId].url
      stopBgTrailer()
      startPlayback()
    end if
  end if
end sub

sub startPlayback()
  m.isPlaying = true
  m.spinner.visible = true
  m.statusLabel.text = ""
  m.detailPanel.visible = false

  ' RAF - Roku Ad Framework Scaffolding (Required for Certification)
  ' adIface = Roku_Ads()
  ' adIface.setAdUrl("YOUR_VAST_AD_URL_HERE")
  ' adPods = adIface.getAds()
  ' if adPods <> invalid and adPods.count() > 0
  '   adIface.showAds(adPods)
  ' end if

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

  ' Restart background trailer
  m.trailerTimer.control = "start"
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

  if m.accountScene.visible
    if key = "back" and not m.accountScene.findNode("legalScene").visible
      m.accountScene.visible = false
      m.accountBtnBg.setFocus(true)
      return true
    end if
    return false ' Let AccountScene handle its own internal keys (like OK on legal btn)
  end if

  if m.exitDialogShowing
    m.exitDialog.visible = false
    m.exitDialogShowing = false
    m.contentRowList.setFocus(true)
    return true
  end if

  ' Handle Account Button Focus
  if key = "up" and not m.isPlaying and m.accountBtnBg.opacity = 1.0 ' Not currently focused
    focused = m.contentRowList.rowItemFocused
    if focused <> invalid and focused[0] = 0 ' Only allow from top row
      m.accountBtnBg.opacity = 0.5 ' Visual focus state
      m.accountBtnBg.setFocus(true) ' Actually meaningless for Rectangle, just for our state
      return true
    end if
  end if

  if key = "down" and m.accountBtnBg.opacity = 0.5
    m.accountBtnBg.opacity = 1.0
    m.contentRowList.setFocus(true)
    return true
  end if

  if key = "OK" and m.accountBtnBg.opacity = 0.5
    m.accountScene.visible = true
    m.accountScene.setFocus(true)
    return true
  end if

  ' Play button — play trailer when on home screen
  if key = "play" and not m.isPlaying
    m.currentContentId = "trailer"
    m.streamUrl = m.catalog["trailer"].url
    stopBgTrailer()
    startPlayback()
    return true
  end if

  if key = "back" and m.accountBtnBg.opacity = 0.5
    m.accountBtnBg.opacity = 1.0
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
