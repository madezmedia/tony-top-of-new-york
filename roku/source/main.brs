sub Main(args as dynamic)
  screen = CreateObject("roSGScreen")
  m.port = CreateObject("roMessagePort")
  screen.setMessagePort(m.port)

  scene = screen.CreateScene("HomeScene")
  screen.show()

  ' Pass deep link args if any
  if args.contentId <> invalid and args.mediaType <> invalid
    scene.callFunc("playContent", {contentId: args.contentId, mediaType: args.mediaType})
  end if

  while true
    msg = wait(0, m.port)
    msgType = type(msg)
    if msgType = "roSGScreenEvent"
      if msg.isScreenClosed() then return
    end if
  end while
end sub
