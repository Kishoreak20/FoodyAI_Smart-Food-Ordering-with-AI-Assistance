package com.foody.backend.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

public record OrderRequest(
        @NotBlank
        @Size(max = 100)
        String customerName,

        @NotEmpty
        List<@Valid OrderLineRequest> items
) {}
