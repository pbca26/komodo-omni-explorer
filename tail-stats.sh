cp stats.log stats-old.log;
rm stats.log;
tail -1000 stats-old.log > stats.log