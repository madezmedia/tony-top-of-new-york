' ===========================================================
' HomeScene.brs — T.O.N.Y. Roku App Home Screen
' Hero banner + Episode grid + Public Mux playback
' Full focus chain debugging included
' ===========================================================

sub init()
  m.episodeGrid = m.top.findNode("episodeGrid")
  m.loadingSpinner = m.top.findNode("loadingSpinner")
  m.statusLabel = m.top.findNode("statusLabel")

  ' Hero elements
  m.heroImage = m.top.findNode("heroImage")
  m.heroEpisodeTitle = m.top.findNode("heroEpisodeTitle")
  m.heroEpisodeMeta = m.top.findNode("heroEpisodeMeta")
  m.heroEpisodeDesc = m.top.findNode("heroEpisodeDesc")
  m.playPrompt = m.top.findNode("playPrompt")

  m.episodeGrid.observeField("itemFocused", "onEpisodeFocused")
  m.episodeGrid.observeField("itemSelected", "onEpisodeSelected")

  ' Track focus changes for debugging
  m.top.observeField("focusedChild", "onSceneFocusChanged")

  ' Store episode metadata for lookup
  m.episodeData = []
  m.playerGroup = invalid

  print "[TONY] init() — starting feed fetch"
  m.statusLabel.text = "Fetching episodes..."
  fetchEpisodes()
end sub

sub onSceneFocusChanged()
  child = m.top.focusedChild
  if child <> invalid
    print "[TONY] Scene focused child: " + child.id
  else
    print "[TONY] Scene focused child: NONE"
  end if
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
    print "[TONY] Feed loaded: " + str(parsed.episodes.count()).trim() + " episodes"
    m.statusLabel.text = str(parsed.episodes.count()).trim() + " episodes"
    buildEpisodeGrid(parsed.episodes)
  else
    print "[TONY] Feed empty or invalid — using fallback"
    m.statusLabel.text = "Feed empty — using fallback"
    useFallbackEpisode()
  end if
  m.loadingSpinner.visible = false
end sub

sub onFeedError()
  print "[TONY] Feed error: " + m.feedTask.error
  m.statusLabel.text = "Feed error — using fallback"
  useFallbackEpisode()
  m.loadingSpinner.visible = false
end sub

sub useFallbackEpisode()
  fallback = [{
    id: "episode-one",
    title: "T.O.N.Y. Episode 1 — REMIXX",
    description: "Follow the rise of Tony as he navigates the treacherous streets of the Bronx in this gripping crime saga.",
    thumbnail: "https://image.mux.com/GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko/thumbnail.jpg?width=1920&height=1080",
    streamUrl: "https://stream.mux.com/GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko.m3u8",
    runtime: 7959,
    season: 1,
    episode: 1,
    rating: "TV-MA"
  }]
  buildEpisodeGrid(fallback)
end sub

sub buildEpisodeGrid(episodes as object)
  contentNode = CreateObject("roSGNode", "ContentNode")
  m.episodeData = []

  for each ep in episodes
    item = contentNode.createChild("ContentNode")
    item.title = ep.title

    if ep.thumbnail <> invalid then
      gridThumb = ep.thumbnail
      gridThumb = gridThumb.replace("width=1920", "width=320")
      gridThumb = gridThumb.replace("height=1080", "height=180")
      item.hdPosterUrl = gridThumb
      item.sdPosterUrl = gridThumb
    end if

    epMeta = {
      id: ep.id,
      title: ep.title,
      streamUrl: ep.streamUrl,
      description: "",
      season: 1,
      episode: 1,
      rating: "TV-MA",
      thumbnail: ""
    }
    if ep.description <> invalid then epMeta.description = ep.description
    if ep.season <> invalid then epMeta.season = ep.season
    if ep.episode <> invalid then epMeta.episode = ep.episode
    if ep.rating <> invalid then epMeta.rating = ep.rating
    if ep.thumbnail <> invalid then epMeta.thumbnail = ep.thumbnail

    m.episodeData.push(epMeta)
  end for

  m.episodeGrid.content = contentNode

  print "[TONY] Grid content set: " + str(contentNode.getChildCount()).trim() + " items"

  ' *** CRITICAL: Focus the Scene first, then the grid ***
  m.top.setFocus(true)
  m.episodeGrid.setFocus(true)

  print "[TONY] Grid isInFocusChain: " + str(m.episodeGrid.isInFocusChain())
  print "[TONY] Grid hasFocus: " + str(m.episodeGrid.hasFocus())

  ' Show first episode in hero
  if m.episodeData.count() > 0
    updateHero(0)
  end if

  m.statusLabel.text = "Select an episode"
end sub

sub onEpisodeFocused()
  focusedIndex = m.episodeGrid.itemFocused
  print "[TONY] Episode focused: " + str(focusedIndex).trim()
  if focusedIndex >= 0 and focusedIndex < m.episodeData.count()
    updateHero(focusedIndex)
  end if
end sub

sub updateHero(index as integer)
  ep = m.episodeData[index]

  if ep.thumbnail <> "" then
    m.heroImage.uri = ep.thumbnail
  end if

  m.heroEpisodeTitle.text = ep.title
  m.heroEpisodeMeta.text = "S" + str(ep.season).trim() + " E" + str(ep.episode).trim() + "  •  " + ep.rating
  m.heroEpisodeDesc.text = ep.description
  m.playPrompt.visible = true
end sub

sub onEpisodeSelected()
  selectedIndex = m.episodeGrid.itemSelected
  print "[TONY] Episode SELECTED via grid event: " + str(selectedIndex).trim()
  if selectedIndex >= 0 and selectedIndex < m.episodeData.count()
    epData = m.episodeData[selectedIndex]
    m.statusLabel.text = "Playing: " + epData.title
    playEpisode(epData)
  end if
end sub

sub playEpisode(args as object)
  print "[TONY] playEpisode — id: " + args.id + " | streamUrl: " + args.streamUrl

  m.playerGroup = CreateObject("roSGNode", "PlayerScene")
  m.top.appendChild(m.playerGroup)
  m.playerGroup.visible = true

  m.playerGroup.episodeTitle = args.title
  if args.streamUrl <> invalid and args.streamUrl <> "" then
    m.playerGroup.streamUrl = args.streamUrl
  end if
  m.playerGroup.episodeId = args.id
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  print "[TONY] onKeyEvent — key: " + key + " press: " + str(press)

  if not press then return false

  if key = "back"
    if m.playerGroup <> invalid and m.playerGroup.visible
      print "[TONY] Closing player, returning to grid"
      m.playerGroup.visible = false
      m.top.removeChild(m.playerGroup)
      m.playerGroup = invalid
      m.episodeGrid.setFocus(true)
      m.statusLabel.text = "Select an episode"
      return true
    end if
  end if

  ' Catch OK at Scene level as fallback
  if key = "OK"
    print "[TONY] OK pressed at Scene level"
    if m.playerGroup = invalid or not m.playerGroup.visible
      focusedIndex = m.episodeGrid.itemFocused
      print "[TONY] itemFocused index: " + str(focusedIndex).trim()
      if focusedIndex < 0 or focusedIndex >= m.episodeData.count()
        focusedIndex = 0
      end if
      if m.episodeData.count() > 0
        epData = m.episodeData[focusedIndex]
        print "[TONY] Playing from Scene handler: " + epData.title
        m.statusLabel.text = "Playing: " + epData.title
        playEpisode(epData)
        return true
      end if
    end if
  end if

  return false
end function
