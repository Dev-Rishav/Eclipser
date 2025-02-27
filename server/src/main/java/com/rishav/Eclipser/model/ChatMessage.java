package com.rishav.Eclipser.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int message_id;
    private String sender_id;
    private String receiver_id;
    private String content;
    private String send_at;
    private Boolean is_read;

    // Getters and setters


    @Override
    public String toString() {
        return "ChatMessage{" +
                "message_id=" + message_id +
                ", sender_id='" + sender_id + '\'' +
                ", receiver_id='" + receiver_id + '\'' +
                ", content='" + content + '\'' +
                ", send_at=" + send_at +
                ", is_read=" + is_read +
                '}';
    }

    public int getMessage_id() {
        return message_id;
    }

    public void setMessage_id(int message_id) {
        this.message_id = message_id;
    }

    public String getSender_id() {
        return sender_id;
    }

    public void setSender_id(String sender_id) {
        this.sender_id = sender_id;
    }

    public String getReceiver_id() {
        return receiver_id;
    }

    public void setReceiver_id(String receiver_id) {
        this.receiver_id = receiver_id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getSend_at() {
        return send_at;
    }

    public void setSend_at(String send_at) {
        this.send_at = send_at;
    }

    public Boolean getIs_read() {
        return is_read;
    }

    public void setIs_read(Boolean is_read) {
        this.is_read = is_read;
    }
}