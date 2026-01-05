package service

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/magenta9/ai-web-tools/server/internal/model"
	"github.com/magenta9/ai-web-tools/server/internal/repository"
	"github.com/shirou/gopsutil/v3/process"
)

func StartMonitor(repo *repository.Repository) {
	ticker := time.NewTicker(10 * time.Second)
	go func() {
		for range ticker.C {
			collectStats(repo)
		}
	}()
}

func collectStats(repo *repository.Repository) {
	pid := int32(os.Getpid())
	proc, err := process.NewProcess(pid)
	if err != nil {
		log.Printf("Monitor error: failed to get process: %v", err)
		return
	}

	cpuPercent, err := proc.CPUPercent()
	if err != nil {
		log.Printf("Monitor error: failed to get CPU percent: %v", err)
		return
	}

	memInfo, err := proc.MemoryInfo()
	if err != nil {
		log.Printf("Monitor error: failed to get memory info: %v", err)
		return
	}

	stat := &model.SystemStat{
		CPUPercent:  cpuPercent,
		MemoryUsage: float64(memInfo.RSS) / 1024 / 1024, // Convert to MB
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := repo.CreateSystemStat(ctx, stat); err != nil {
		log.Printf("Monitor error: failed to save stats: %v", err)
	}
}
