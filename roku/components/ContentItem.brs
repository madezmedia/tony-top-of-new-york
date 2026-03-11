' ContentItem.brs — Renders poster tiles for RowList
sub onContentChange()
  item = m.top.itemContent
  if item = invalid then return

  poster = m.top.findNode("poster")
  titleLabel = m.top.findNode("titleLabel")
  comingSoonOverlay = m.top.findNode("comingSoonOverlay")
  comingSoonLabel = m.top.findNode("comingSoonLabel")

  poster.uri = item.HDPosterUrl
  titleLabel.text = item.title

  ' Show "Coming Soon" overlay for placeholder items
  if item.description = "coming_soon"
    comingSoonOverlay.visible = true
    comingSoonLabel.visible = true
  else
    comingSoonOverlay.visible = false
    comingSoonLabel.visible = false
  end if
end sub
