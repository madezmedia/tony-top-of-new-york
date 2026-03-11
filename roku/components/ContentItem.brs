' ContentItem.brs — Professional episode tile renderer
sub onContentChange()
  item = m.top.itemContent
  if item = invalid then return

  poster = m.top.findNode("poster")
  titleLabel = m.top.findNode("titleLabel")
  subtitleLabel = m.top.findNode("subtitleLabel")
  comingSoonOverlay = m.top.findNode("comingSoonOverlay")
  comingSoonLabel = m.top.findNode("comingSoonLabel")
  episodeBadgeBg = m.top.findNode("episodeBadgeBg")
  episodeBadge = m.top.findNode("episodeBadge")
  durationBg = m.top.findNode("durationBg")
  durationLabel = m.top.findNode("durationLabel")
  newBadgeBg = m.top.findNode("newBadgeBg")
  newBadge = m.top.findNode("newBadge")

  poster.uri = item.HDPosterUrl
  titleLabel.text = item.title

  ' Parse custom data from ShortDescriptionLine2 (format: "ep|duration|meta|flags")
  meta = item.ShortDescriptionLine2
  if meta <> invalid and meta <> ""
    parts = meta.split("|")

    ' Episode number badge
    if parts.count() > 0 and parts[0] <> ""
      episodeBadge.text = parts[0]
      episodeBadge.visible = true
      episodeBadgeBg.visible = true
    end if

    ' Duration badge
    if parts.count() > 1 and parts[1] <> ""
      durationLabel.text = parts[1]
      durationLabel.visible = true
      durationBg.visible = true
    end if

    ' Subtitle / meta text
    if parts.count() > 2 and parts[2] <> ""
      subtitleLabel.text = parts[2]
    end if

    ' Flags (new, coming_soon)
    if parts.count() > 3
      flags = parts[3]
      if flags.instr("new") >= 0
        newBadge.visible = true
        newBadgeBg.visible = true
      end if
    end if
  end if

  ' Show "Coming Soon" overlay
  if item.description = "coming_soon"
    comingSoonOverlay.visible = true
    comingSoonLabel.visible = true
    episodeBadgeBg.visible = false
    episodeBadge.visible = false
  end if
end sub

sub onFocusChange()
  ' Could add scale/glow animation on focus in the future
end sub
