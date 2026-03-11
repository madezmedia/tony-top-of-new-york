sub Main(args as dynamic)
  screen = CreateObject("roSGScreen")
  m.port = CreateObject("roMessagePort")
  screen.setMessagePort(m.port)

  scene = screen.CreateScene("HomeScene")
  screen.show()

  ' Deep linking support (required for certification)
  if args <> invalid
    if args.contentId <> invalid and args.mediaType <> invalid
      scene.deepLinkContentId = args.contentId
      scene.deepLinkMediaType = args.mediaType
    end if
  end if

  while true
    msg = wait(0, m.port)
    msgType = type(msg)
    if msgType = "roSGScreenEvent"
      if msg.isScreenClosed() then return
    end if
  end while
end sub
