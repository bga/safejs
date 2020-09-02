export #(min, max) {
  if(max == null) {
    max = min
    min = 0
  }
  -> 0|(min + Math.random() * (max - min))
}
