' ===========================================================
' HomeScene.brs — T.O.N.Y. Roku App Home Screen
' ===========================================================

sub init()
  m.episodeGrid = m.top.findNode("episodeGrid")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.statusLabel = m.top.findNode("statusLabel")

  m.episodeGrid.observeField("itemSelected", "onEpisodeSelected")

  ' Store episode metadata so we can look up streamUrl later
  m.episodeData = []

  m.statusLabel.text = "Fetching episodes..."
  fetchEpisodes()
end sub

sub fetchEpisodes()
  m.loadingSpinner.visible = true

  m.feedTask = CreateObject("roSGNode", "FeedFetchTask")
  m.feedTask.observeField("feedData", "onFeedFetched")
  m.feedTask.observeField("error", "onFeedError")
  m.feedTask.control = "RUN"
end sub

sub onFeedFetched()
  parsed = m.feedTask.feedData
  if parsed <> invalid and parsed.episodes <> invalid and parsed.episodes.count() > 0
    m.statusLabel.text = "Loaded " + str(parsed.episodes.count()).trim() + " episodes"
    buildEpisodeGrid(parsed.episodes)
  else
    m.statusLabel.text = "Feed empty — using fallback episode"
    useFallbackEpisode()
  end if
  m.loadingSpinner.visible = false
end sub

sub onFeedError()
  m.statusLabel.text = "Feed error — using fallback episode"
  useFallbackEpisode()
  m.loadingSpinner.visible = false
end sub

' Hardcoded fallback so the app ALWAYS has something to play
sub useFallbackEpisode()
  fallback = [{
    id: "episode-one",
    title: "T.O.N.Y. Episode 1",
    description: "Season 1, Episode 1",
    thumbnail: "https://image.mux.com/GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko/thumbnail.jpg?width=400&height=225",
    streamUrl: "https://stream.mux.com/GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko.m3u8",
    runtime: 7959
  }]
  buildEpisodeGrid(fallback)
end sub

sub buildEpisodeGrid(episodes as object)
  contentNode = CreateObject("roSGNode", "ContentNode")

  ' Store metadata in m.episodeData for lookup on selection
  m.episodeData = []

  for each ep in episodes
    item = contentNode.createChild("ContentNode")
    item.title = ep.title
    if ep.description <> invalid then
      item.description = ep.description
    end if
    if ep.thumbnail <> invalid then
      item.hdPosterUrl = ep.thumbnail
      item.sdPosterUrl = ep.thumbnail
    end if

    ' Store the episode data for lookup when selected
    m.episodeData.push({
      id: ep.id,
      title: ep.title,
      streamUrl: ep.streamUrl
    })
  end for

  m.episodeGrid.content = contentNode
  m.episodeGrid.setFocus(true)
  m.statusLabel.text = "Ready — select an episode"
end sub

sub onEpisodeSelected()
  selectedIndex = m.episodeGrid.itemSelected
  if selectedIndex >= 0 and selectedIndex < m.episodeData.count()
    epData = m.episodeData[selectedIndex]
    m.statusLabel.text = "Playing: " + epData.title
    playEpisode(epData)
  end if
end sub

sub playEpisode(args as object)
  ' Create player overlay
  m.playerGroup = CreateObject("roSGNode", "PlayerScene")

  ' Attach to scene FIRST so nodes exist
  m.top.appendChild(m.playerGroup)
  m.playerGroup.visible = true

  ' THEN set fields (episodeId must be LAST since it triggers playback)
  m.playerGroup.episodeTitle = args.title
  if args.streamUrl <> invalid and args.streamUrl <> "" then
    m.playerGroup.streamUrl = args.streamUrl
  end if
  m.playerGroup.episodeId = args.id
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  if press and key = "back"
    ' If player is showing, close it and return to grid
    if m.playerGroup <> invalid and m.playerGroup.visible
      m.playerGroup.visible = false
      m.top.removeChild(m.playerGroup)
      m.playerGroup = invalid
      m.episodeGrid.setFocus(true)
      m.statusLabel.text = "Ready — select an episode"
      return true
    end if
  end if
  return false
end function
