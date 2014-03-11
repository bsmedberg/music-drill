function Drill(o)
{
  this.total_ = validateRange(o.total, 1);
}
Drill.prototype.start = function() {
  this.start_time_ = Date.now();
  this.count_ = 0;
  this.missed_ = 0;
  this.interval_ = setInterval(this.interval_function_.bind(this), 50);
  this.done_ = null;
  g("goContainer").classList.add("hidden");
};
Drill.prototype.interval_function_ = function()
{
  var secs = (Date.now() - this.start_time_) / 1000;
  g("time").textContent = secsToString(secs);
};
Drill.prototype.update_counts_ = function() {
  g("completed").textContent = this.count_;
  g("missed").textContent = this.missed_;
};
Drill.prototype.done = function() {
  return this.done_ != null;
};
Drill.prototype.pass = function() {
  this.flash_("ok");
  this.count_++;
  this.update_counts_();
  if (this.count_ == this.total_) {
    this.finish_();
  }
};
Drill.prototype.fail = function() {
  this.flash_("fail");
  this.missed_++;
  this.update_counts_();
};
Drill.prototype.finish_ = function() {
  this.done_ = (Date.now() - this.start_time_) / 1000;
  clearInterval(this.interval_);
  g("resultCount").textContent = this.count_;
  g("resultTime").textContent = secsToString(this.done_);
  if (this.missed_) {
    var e = g("resultErrors");
    e.textContent = "Errors: " + this.missed_ + ".";
    e.classList.remove("hidden");
  }
  g("rate").textContent = (this.done_ / this.total_).toFixed(1);
  g("resultContainer").classList.remove("hidden");
};
Drill.prototype.flash_ = function(cls) {
  clearTimeout(this.unflash_);
  g("result").classList.add(cls);
  setTimeout(this.unflash_, 500);
};
Drill.prototype.unflash_ = function() {
  var cl = g("result").classList;
  cl.remove("ok");
  cl.remove("fail");
};
