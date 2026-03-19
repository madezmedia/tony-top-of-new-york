Library "Roku_Ads.brs"

sub Main(args as dynamic)
  screen = CreateObject("roSGScreen")
  m.port = CreateObject("roMessagePort")
  screen.setMessagePort(m.port)
  
  ' App Info Context
  m.global = screen.getGlobalNode()
  m.global.addField("appInfo", "assocarray", true)
  m.global.appInfo = {
    id: "dev.tony.series",
    name: "TONY - Top of New York"
  }

  scene = screen.CreateScene("HomeScene")
  screen.show()

  ' Deep linking support (required for certification)
  if args <> invalid
    if args.contentId <> invalid and args.mediaType <> invalid
      scene.deepLinkMediaType = args.mediaType
      scene.deepLinkContentId = args.contentId
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
