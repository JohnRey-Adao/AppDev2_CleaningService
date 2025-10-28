package com.adao.entity;

public enum CleanerStatus {
    PENDING_APPROVAL,  // Keep for backward compatibility with existing data
    AVAILABLE,
    BUSY,
    OFFLINE,
    ON_BREAK
}
