<script lang="ts">
import { defineComponent, type PropType } from 'vue';

const CLASSES = {
    'France': 'text-bg-danger',
    'Spain': 'text-bg-warning',
    'Germany': 'text-bg-success',

    'Marketing': 'text-bg-primary opacity-50',
    'HR': 'text-bg-primary opacity-75',
    'Security': 'text-bg-primary',
};

export default defineComponent({
    props: {
        name: {
            required: true,
            type: String as PropType<keyof typeof CLASSES>,
        },
    },

    computed: {
        classes(): string {
            return CLASSES[this.name];
        },
    },
})
</script>
<template>
    <span class="badge rounded-pill d-inline-flex align-items-center" :class="classes">
        <svg xmlns=" http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" width="15px" class="me-1">
            <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
        <span>{{ name }}</span>
    </span>
</template>
