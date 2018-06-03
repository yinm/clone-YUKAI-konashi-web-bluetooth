QUnit.test('.find', assert => {
  return Konashi.find(true, {}).then(_k => {
    assert.ok(_k instanceof Konashi)
  })
})
