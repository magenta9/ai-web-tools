package handler

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/magenta9/ai-web-tools/server/internal/repository"
	"github.com/shirou/gopsutil/v3/process"
)

type MonitorHandler struct {
	repo *repository.Repository
}

func NewMonitorHandler(repo *repository.Repository) *MonitorHandler {
	return &MonitorHandler{repo: repo}
}

func (h *MonitorHandler) GetStats(c *gin.Context) {
	// 1. Auth check: Ensure user is "root"
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	user, err := h.repo.GetUserByID(userID.(int))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user"})
		return
	}

	if user.Username != "root" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden: Requires root access"})
		return
	}

	// 2. Get process stats
	pid := int32(os.Getpid())
	proc, err := process.NewProcess(pid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get process: %v", err)})
		return
	}

	cpuPercent, err := proc.CPUPercent()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get CPU percent: %v", err)})
		return
	}

	memInfo, err := proc.MemoryInfo()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to get memory info: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"cpu_percent":  cpuPercent,
		"memory_usage": float64(memInfo.RSS) / 1024 / 1024, // Convert to MB
	})
}
