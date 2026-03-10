sub init()
  m.episodeGrid = m.top.findNode("episodeGrid")
  m.loadingSpinner = m.top.findNode("loadingSpinner")

  m.episodeGrid.observeField("itemSelected", "onEpisodeSelected")

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
  if parsed <> invalid and parsed.episodes <> invalid
    print "[TONY] Feed loaded: " + str(parsed.episodes.count()) + " episodes"
    buildEpisodeGrid(parsed.episodes)
  else
    print "[TONY] Feed returned invalid or no episodes"
  end if
  m.loadingSpinner.visible = false
end sub

sub onFeedError()
  print "Error fetching feed: " + m.feedTask.error
  m.loadingSpinner.visible = false
end sub

sub buildEpisodeGrid(episodes as object)
  contentNode = CreateObject("roSGNode", "ContentNode")

  row = contentNode.createChild("ContentNode")
  row.title = "Season 1 Episodes"

  for each ep in episodes
    item = row.createChild("ContentNode")
    item.title = ep.title
    item.description = ep.description
    item.hdPosterUrl = ep.thumbnail
    item.length = ep.runtime
    item.rating = ep.rating
    item.CONTENTID = ep.id  ' CONTENTID is writable; .id is read-only
    item.url = ep.streamUrl  ' Mux public playback URL
    print "[TONY] Added episode: " + ep.title + " | streamUrl: " + ep.streamUrl
  end for

  m.episodeGrid.content = contentNode
end sub

sub onEpisodeSelected()
  selectedItem = m.episodeGrid.content.getChild(0).getChild(m.episodeGrid.itemSelected)
  if selectedItem <> invalid
    print "[TONY] Selected: " + selectedItem.title + " | CONTENTID: " + selectedItem.CONTENTID + " | url: " + selectedItem.url
    playEpisode({
      id: selectedItem.CONTENTID,
      title: selectedItem.title,
      streamUrl: selectedItem.url
    })
  end if
end sub

sub playEpisode(args as object)
  playerScene = CreateObject("roSGNode", "PlayerScene")
  
  m.top.appendChild(playerScene)
  playerScene.visible = true

  playerScene.episodeTitle = args.title
  if args.streamUrl <> invalid then
    playerScene.streamUrl = args.streamUrl
  end if
  playerScene.episodeId = args.id
end sub

function playContent(args as object) as void
  ' Handle deep link launches
  ' For deep links, we only have contentId, so fetch from feed first
  playEpisode({id: args.contentId, title: "", streamUrl: ""})
end function
