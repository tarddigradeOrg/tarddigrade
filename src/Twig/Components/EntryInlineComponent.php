<?php

namespace App\Twig\Components;

use App\Entity\Entry;
use Symfony\UX\TwigComponent\Attribute\AsTwigComponent;

#[AsTwigComponent('entry_inline')]
final class EntryInlineComponent
{
    public Entry $entry;
}
