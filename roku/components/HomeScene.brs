sub init()
  m.episodeGrid = m.top.findNode("episodeGrid")
  m.loadingSpinner = m.top.findNode("loadingSpinner")

  m.episodeGrid.observeField("itemSelected", "onEpisodeSelected")

  fetchEpisodes()
end sub

sub fetchEpisodes()
  m.loadingSpinner.visible = true

  ' Fetch episode list from JSON API
  request = CreateObject("roUrlTransfer")
  request.setUrl("https://tony-top-of-new-york.vercel.app/api/roku-feed")
  request.setCertificatesFile("common:/certs/ca-bundle.crt")
  request.addHeader("Content-Type", "application/json")

  response = request.GetToString()
  if response <> ""
    parsed = ParseJson(response)
    if parsed <> invalid and parsed.episodes <> invalid
      buildEpisodeGrid(parsed.episodes)
    end if
  end if

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
    item.id = ep.id  ' slug used to fetch token
  end for

  m.episodeGrid.content = contentNode
end sub

sub onEpisodeSelected()
  selectedItem = m.episodeGrid.content.getChild(0).getChild(m.episodeGrid.itemSelected)
  if selectedItem <> invalid
    m.top.getScene().callFunc("playEpisode", {id: selectedItem.id, title: selectedItem.title})
  end if
end sub

function playContent(args as object) as void
  ' Handle deep link launches
  m.top.getScene().callFunc("playEpisode", {id: args.contentId, title: ""})
end function
