' LegalScene.brs
sub init()
  m.backBtnBg = m.top.findNode("backBtnBg")
  m.backBtnBg.opacity = 0.5 ' Focus state
end sub

function onKeyEvent(key as string, press as boolean) as boolean
  if not press then return false
  
  if key = "OK" or key = "back"
    m.top.visible = false
    return true
  end if
  
  return false
end function
