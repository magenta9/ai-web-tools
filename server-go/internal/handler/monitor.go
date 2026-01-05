package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/magenta9/ai-web-tools/server/internal/repository"
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

	// 2. Get history stats from DB
	limitStr := c.DefaultQuery("limit", "360") // Default to 1 hour (360 * 10s)
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 360
	}

	stats, err := h.repo.GetSystemStats(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
